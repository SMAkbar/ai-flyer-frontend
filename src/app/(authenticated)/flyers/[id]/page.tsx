"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { Container } from "@/components/ui/Container";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { flyersApi, type FlyerDetailRead, type FlyerRead, type FlyerInformationExtractionUpdate, type FlyerUpdate } from "@/lib/api/flyers";
import { wordpressApi, type WordPressPostRead } from "@/lib/api/wordpress";
import { FlyerImageCard } from "@/components/flyers/FlyerImageCard";
import { FlyerHeader } from "@/components/flyers/FlyerHeader";
import { FlyerEventDetailsCard } from "@/components/flyers/FlyerEventDetailsCard";
import { ExtractionCard, type EditedFields } from "@/components/flyers/ExtractionCard";
import { GeneratedImagesSection } from "@/components/flyers/GeneratedImagesSection";
import { WordPressPostingCard } from "@/components/flyers/WordPressPostingCard";
import { InstagramSchedulingPage } from "@/components/flyers/InstagramSchedulingPage";
import { DEFAULT_SORT_OPTION, filterAndSortFlyers, flyersListPath, parseFilterStatus, parseSortOption, type FilterStatus, type SortOption } from "@/lib/utils/flyerFilters";

type AdjacentFlyers = {
  prev: FlyerRead | null;
  next: FlyerRead | null;
};

// Background polling: while any image is being generated or the extraction is
// still in flight, silently re-fetch the flyer so the UI updates without the
// user refreshing the page.
const BACKGROUND_POLL_INTERVAL_MS = 3000;
const BACKGROUND_POLL_MAX_DURATION_MS = 5 * 60 * 1000;
/** After POST /generate-images, the worker creates rows asynchronously; poll until we see them so polling can start. */
const POST_GENERATE_POLL_INTERVAL_MS = 350;
const POST_GENERATE_POLL_MAX_MS = 15_000;

function hasInFlightImageGeneration(flyer: FlyerDetailRead | null): boolean {
  return Boolean(
    flyer?.generated_images?.some(
      (img) =>
        img.generation_status === "requested" ||
        img.generation_status === "generating"
    )
  );
}

function hasInFlightExtraction(flyer: FlyerDetailRead | null): boolean {
  const status = flyer?.information_extraction?.status;
  return status === "pending" || status === "processing";
}

function instagramScheduleButtonLabel(flyer: FlyerDetailRead): string {
  const carousel = flyer.carousel_post_status;
  const story = flyer.story_post_status;

  if (carousel === "posted" && story === "posted") {
    return "Instagram Posted";
  }
  if (carousel === "posted" || story === "posted") {
    return "Instagram Partially Posted";
  }
  if (carousel === "scheduled" || story === "scheduled") {
    return "Instagram Scheduled";
  }
  return "Schedule Instagram Posts";
}

async function refreshUntilImageGenerationInFlight(
  flyerId: number,
  setFlyerData: (data: FlyerDetailRead) => void
): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < POST_GENERATE_POLL_MAX_MS) {
    const result = await flyersApi.getById(flyerId);
    if (result.ok) {
      setFlyerData(result.data);
      if (hasInFlightImageGeneration(result.data)) return;
    }
    await new Promise((resolve) => setTimeout(resolve, POST_GENERATE_POLL_INTERVAL_MS));
  }
}

export default function FlyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flyerId = params?.id ? parseInt(params.id as string, 10) : null;

  // Read list context from URL so back navigation restores filters/sort.
  const filterStatus = parseFilterStatus(searchParams.get("filter"));
  const searchQuery = searchParams.get("search") || "";
  const sortOption = parseSortOption(searchParams.get("sort"));

  const [flyer, setFlyer] = useState<FlyerDetailRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<EditedFields>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingEventDetails, setIsSavingEventDetails] = useState(false);
  // Transient flags for the brief window between clicking an action and the
  // server responding. After that, "in-flight" state is derived from the
  // flyer payload itself so the UI stays correct across page reloads.
  const [isStartingGeneration, setIsStartingGeneration] = useState(false);
  const [isStartingRetry, setIsStartingRetry] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showWordPressPosting, setShowWordPressPosting] = useState(false);
  const [showInstagramScheduling, setShowInstagramScheduling] = useState(false);
  const [wordpressPost, setWordpressPost] = useState<WordPressPostRead | null>(null);
  const [adjacentFlyers, setAdjacentFlyers] = useState<AdjacentFlyers>({ prev: null, next: null });

  const imagesInFlight = useMemo(() => hasInFlightImageGeneration(flyer), [flyer]);
  const extractionInFlight = useMemo(() => hasInFlightExtraction(flyer), [flyer]);
  const isGeneratingImages = isStartingGeneration || imagesInFlight;
  const isRetryingExtraction = isStartingRetry || extractionInFlight;

  useEffect(() => {
    if (flyerId) {
      // Reset edited fields and inline panels when changing flyers
      setEditedFields({});
      setShowInstagramScheduling(false);
      loadFlyer();
      loadWordPressPost();
      loadAdjacentFlyers();
    }
  }, [flyerId, filterStatus, searchQuery, sortOption]);

  // Auto-poll the flyer while there is in-flight work. The effect re-evaluates
  // whenever those derived flags change, so polling stops automatically once
  // every image has reached a terminal status and extraction is settled.
  useEffect(() => {
    if (!flyerId) return;
    if (!imagesInFlight && !extractionInFlight) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();

    const tick = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt > BACKGROUND_POLL_MAX_DURATION_MS) return;

      try {
        const result = await flyersApi.getById(flyerId);
        if (cancelled) return;
        if (result.ok) {
          setFlyer(result.data);
        }
      } catch {
        // Swallow transient network errors and retry on the next tick.
      }

      if (!cancelled) {
        timeoutId = setTimeout(tick, BACKGROUND_POLL_INTERVAL_MS);
      }
    };

    timeoutId = setTimeout(tick, BACKGROUND_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [flyerId, imagesInFlight, extractionInFlight]);

  async function loadAdjacentFlyers() {
    if (!flyerId) return;

    try {
      const result = await flyersApi.getAll();
      if (result.ok) {
        // Apply the same filtering logic as the list page
        const filteredFlyers = filterAndSortFlyers(result.data, filterStatus, searchQuery, sortOption);
        const currentIndex = filteredFlyers.findIndex((f) => f.id === flyerId);
        
        if (currentIndex !== -1) {
          setAdjacentFlyers({
            prev: currentIndex > 0 ? filteredFlyers[currentIndex - 1] : null,
            next: currentIndex < filteredFlyers.length - 1 ? filteredFlyers[currentIndex + 1] : null,
          });
        } else {
          // Current flyer not in filtered list, no adjacent flyers
          setAdjacentFlyers({ prev: null, next: null });
        }
      }
    } catch (err) {
      // Ignore errors for adjacent flyers - not critical
    }
  }

  async function loadWordPressPost() {
    if (!flyerId) return;

    try {
      const result = await wordpressApi.getPost(flyerId);
      if (result.ok && result.data) {
        setWordpressPost(result.data);
      }
    } catch (err) {
      // Ignore errors - WordPress post may not exist
    }
  }

  async function loadFlyer(options?: { silent?: boolean }) {
    if (!flyerId) return;

    const silent = options?.silent ?? false;
    // A silent refresh keeps the existing page rendered (per-image
    // "Generating…" cards remain visible) instead of swapping in the
    // full-page loader.
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result = await flyersApi.getById(flyerId);

      if (result.ok) {
        setFlyer(result.data);
      } else if (!silent) {
        setError(result.error.message || "Failed to load flyer");
      }
    } catch {
      if (!silent) {
        setError("An unexpected error occurred");
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  // Track field changes
  const handleFieldChange = useCallback((fieldName: keyof EditedFields, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!flyer?.information_extraction) return false;
    const extraction = flyer.information_extraction;
    
    return Object.entries(editedFields).some(([key, value]) => {
      const fieldKey = key as keyof EditedFields;
      const rawOriginal = extraction[fieldKey as keyof typeof extraction];
      if (fieldKey === "event_end_date" || fieldKey === "event_date") {
        const originalValue = rawOriginal ?? null;
        const normalizedValue = value.trim() ? value.trim() : null;
        return normalizedValue !== originalValue;
      }
      const originalValue = rawOriginal ?? '';
      return value !== originalValue;
    });
  }, [flyer, editedFields]);

  // Save all changes
  const handleSaveAll = async () => {
    if (!flyerId || !flyer?.information_extraction) return;

    // Build update data only with changed fields
    const updateData: FlyerInformationExtractionUpdate = {};
    const extraction = flyer.information_extraction;
    
    for (const [key, value] of Object.entries(editedFields)) {
      const fieldKey = key as keyof EditedFields;
      const rawOriginal = extraction[fieldKey as keyof typeof extraction];
      const originalValue =
        fieldKey === "event_end_date" || fieldKey === "event_date"
          ? (rawOriginal ?? null)
          : (rawOriginal ?? "");
      const normalizedValue =
        fieldKey === "event_end_date" || fieldKey === "event_date"
          ? (value.trim() ? value.trim() : null)
          : value;
      if (normalizedValue !== originalValue) {
        updateData[fieldKey] = normalizedValue;
      }
    }

    // Nothing to save
    if (Object.keys(updateData).length === 0) {
      setEditedFields({});
      return;
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      const result = await flyersApi.updateExtraction(flyerId, updateData);

      if (result.ok) {
        setFlyer((prev) => {
          if (!prev || !prev.information_extraction) return prev;
          return {
            ...prev,
            information_extraction: {
              ...prev.information_extraction,
              ...result.data,
            },
          };
        });
        setEditedFields({});
        setShowInstagramScheduling(false);
      } else {
        setError(result.error.message || "Failed to save changes");
      }
    } catch (err) {
      setError("An unexpected error occurred while saving");
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel all edits
  const handleCancelEdits = useCallback(() => {
    setEditedFields({});
  }, []);

  const handleSaveEventDetails = useCallback(
    async (updateData: FlyerUpdate): Promise<boolean> => {
      if (!flyerId) return false;

      setIsSavingEventDetails(true);
      setError(null);

      try {
        const result = await flyersApi.update(flyerId, updateData);
        if (result.ok) {
          setFlyer(result.data);
          return true;
        }
        setError(result.error.message || "Failed to save event details");
        return false;
      } catch {
        setError("An unexpected error occurred while saving event details");
        return false;
      } finally {
        setIsSavingEventDetails(false);
      }
    },
    [flyerId]
  );

  // Helper function to build navigation URL with query params
  const buildNavigationUrl = useCallback((flyerId: number) => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") {
      params.set("filter", filterStatus);
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery);
    }
    if (sortOption !== DEFAULT_SORT_OPTION) {
      params.set("sort", sortOption);
    }
    const queryString = params.toString();
    return queryString ? `/flyers/${flyerId}?${queryString}` : `/flyers/${flyerId}`;
  }, [filterStatus, searchQuery, sortOption]);

  const navigateToAdjacentFlyer = useCallback(
    (direction: "prev" | "next") => {
      const target = adjacentFlyers[direction];
      if (!target) return;
      router.push(buildNavigationUrl(target.id));
    },
    [adjacentFlyers, buildNavigationUrl, router]
  );

  // Shift+Arrow keyboard shortcuts for prev/next flyer navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        if (!adjacentFlyers.prev) return;
        event.preventDefault();
        navigateToAdjacentFlyer("prev");
      } else if (event.key === "ArrowRight") {
        if (!adjacentFlyers.next) return;
        event.preventDefault();
        navigateToAdjacentFlyer("next");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [adjacentFlyers, navigateToAdjacentFlyer]);

  // Handler to navigate back to flyers page, preserving filter params
  const handleBackToFlyers = useCallback(() => {
    router.push(
      flyersListPath({
        filter: filterStatus,
        search: searchQuery,
        sort: sortOption,
      })
    );
  }, [router, filterStatus, searchQuery, sortOption]);

  const handleGenerateImages = async () => {
    if (!flyerId || !flyer?.information_extraction) return;

    setShowInstagramScheduling(false);
    setIsStartingGeneration(true);
    setError(null);

    try {
      const result = await flyersApi.generateImages(flyerId);

      if (!result.ok) {
        setError(result.error.message || "Failed to generate images");
        return;
      }

      // Refresh once, then poll until the worker has created at least one
      // requested/generating row. Otherwise imagesInFlight stays false, the
      // background poll effect never starts, and the UI looks idle until a
      // manual refresh (combined runs last, so this gap is easy to hit).
      await loadFlyer({ silent: true });
      await refreshUntilImageGenerationInFlight(flyerId, setFlyer);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsStartingGeneration(false);
    }
  };

  const handleRetryExtraction = async () => {
    if (!flyerId) return;

    setIsStartingRetry(true);
    setError(null);

    try {
      const result = await flyersApi.retryExtraction(flyerId);
      if (!result.ok) {
        setError(result.error.message || "Failed to retry extraction");
        return;
      }

      // Optimistically mark extraction as processing so the background
      // polling effect picks it up immediately.
      setFlyer((prev) => {
        if (!prev || !prev.information_extraction) return prev;
        return {
          ...prev,
          information_extraction: {
            ...prev.information_extraction,
            status: "processing",
            error_message: null,
          },
        };
      });
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsStartingRetry(false);
    }
  };

  const handleArchiveFlyer = async () => {
    if (!flyerId || isArchiving) return;

    setIsArchiving(true);
    setError(null);

    try {
      const result = await flyersApi.archive(flyerId);
      if (result.ok) {
        handleBackToFlyers();
      } else {
        setError(result.error.message || "Failed to archive flyer");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsArchiving(false);
    }
  };


  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading flyer details..."
      error={error || (!flyer ? "Flyer not found" : null)}
      onRetry={loadFlyer}
    >
      <Container>
        <div style={{ 
          marginBottom: "24px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <BackButton onClick={handleBackToFlyers} />
          
          {/* Flyer Navigation */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px" 
          }}>
            {adjacentFlyers.prev && (
              <button
                onClick={() => navigateToAdjacentFlyer("prev")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "rgba(255, 255, 255, 0.9)",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  maxWidth: "200px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
                title={adjacentFlyers.prev.title}
              >
                <span style={{ fontSize: "18px" }}>←</span>
                <span style={{ 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {adjacentFlyers.prev.title.length > 20 
                    ? adjacentFlyers.prev.title.substring(0, 20) + "..." 
                    : adjacentFlyers.prev.title}
                </span>
              </button>
            )}
            
            {adjacentFlyers.next && (
              <button
                onClick={() => navigateToAdjacentFlyer("next")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "rgba(255, 255, 255, 0.9)",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  maxWidth: "200px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
                title={adjacentFlyers.next.title}
              >
                <span style={{ 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {adjacentFlyers.next.title.length > 20 
                    ? adjacentFlyers.next.title.substring(0, 20) + "..." 
                    : adjacentFlyers.next.title}
                </span>
                <span style={{ fontSize: "18px" }}>→</span>
              </button>
            )}
          </div>
        </div>

        {flyer && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "350px 1fr",
                gap: "12px",
                marginBottom: "32px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  width: "350px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <FlyerImageCard imageUrl={flyer.cloudfront_url} alt={flyer.title} width="100%" />
                <Button
                  variant="secondary"
                  onClick={handleArchiveFlyer}
                  disabled={isArchiving}
                >
                  {isArchiving ? "Archiving..." : "Archive Flyer"}
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  margin: 0,
                  padding: 0,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <FlyerHeader
                  title={flyer.title}
                  description={flyer.description}
                  createdAt={flyer.created_at}
                />

                <ExtractionCard
                  extraction={flyer.information_extraction}
                  editedFields={editedFields}
                  isUpdating={isUpdating}
                  onFieldChange={handleFieldChange}
                  onSaveAll={handleSaveAll}
                  onCancelEdits={handleCancelEdits}
                  hasUnsavedChanges={hasUnsavedChanges()}
                  onGenerateImages={handleGenerateImages}
                  isGeneratingImages={isGeneratingImages}
                  onRetryExtraction={handleRetryExtraction}
                  isRetryingExtraction={isRetryingExtraction}
                  hasGeneratedImages={
                    flyer.generated_images !== null &&
                    flyer.generated_images !== undefined &&
                    flyer.generated_images.length > 0
                  }
                />

                <FlyerEventDetailsCard
                  eventCategory={flyer.event_category ?? null}
                  eventTicketLink={flyer.event_ticket_link ?? null}
                  isSaving={isSavingEventDetails}
                  onSave={handleSaveEventDetails}
                />
              </div>
            </div>

            {flyer.information_extraction?.status === "completed" && (
              <div style={{ marginTop: "24px" }}>
                <GeneratedImagesSection
                  images={flyer.generated_images}
                  isLoading={isGeneratingImages}
                  isGenerating={isGeneratingImages}
                  isAutoRefreshing={imagesInFlight}
                />
                {flyer.generated_images && flyer.generated_images.length > 0 && (
                  <div style={{ marginTop: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <Button
                      onClick={() => setShowInstagramScheduling(true)}
                      variant="primary"
                      disabled={isGeneratingImages}
                    >
                      {instagramScheduleButtonLabel(flyer)}
                    </Button>
                    <Button
                      onClick={() => setShowWordPressPosting(true)}
                      variant="secondary"
                    >
                      {wordpressPost?.post_status === "posted" 
                        ? "View WordPress Post" 
                        : wordpressPost?.post_status === "scheduled"
                        ? "WordPress Scheduled"
                        : "Post to WordPress"}
                    </Button>
                  </div>
                )}

                {showInstagramScheduling && (
                  <InstagramSchedulingPage
                    flyer={flyer}
                    embedded
                    onClose={() => setShowInstagramScheduling(false)}
                  />
                )}
                
                {/* WordPress Posting Modal/Card */}
                {showWordPressPosting && (
                  <WordPressPostingCard
                    flyerId={flyer.id}
                    flyerTitle={flyer.title}
                    flyerImageUrl={flyer.cloudfront_url}
                    existingPost={wordpressPost}
                    onClose={() => setShowWordPressPosting(false)}
                    onPostUpdated={(post) => {
                      setWordpressPost(post);
                      loadWordPressPost();
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
}

