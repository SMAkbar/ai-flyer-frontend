"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { Container } from "@/components/ui/Container";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { flyersApi, type FlyerDetailRead, type FlyerRead, type FlyerInformationExtractionUpdate } from "@/lib/api/flyers";
import { wordpressApi, type WordPressPostRead } from "@/lib/api/wordpress";
import { FlyerImageCard } from "@/components/flyers/FlyerImageCard";
import { FlyerHeader } from "@/components/flyers/FlyerHeader";
import { ExtractionCard, type EditedFields } from "@/components/flyers/ExtractionCard";
import { GeneratedImagesSection } from "@/components/flyers/GeneratedImagesSection";
import { WordPressPostingCard } from "@/components/flyers/WordPressPostingCard";

type AdjacentFlyers = {
  prev: FlyerRead | null;
  next: FlyerRead | null;
};

export default function FlyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params?.id ? parseInt(params.id as string, 10) : null;

  const [flyer, setFlyer] = useState<FlyerDetailRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<EditedFields>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [showWordPressPosting, setShowWordPressPosting] = useState(false);
  const [wordpressPost, setWordpressPost] = useState<WordPressPostRead | null>(null);
  const [adjacentFlyers, setAdjacentFlyers] = useState<AdjacentFlyers>({ prev: null, next: null });
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (flyerId) {
      // Reset edited fields when changing flyers
      setEditedFields({});
      loadFlyer();
      loadWordPressPost();
      loadAdjacentFlyers();
    }
    
    // Cleanup polling timeout on unmount
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [flyerId]);

  async function loadAdjacentFlyers() {
    if (!flyerId) return;

    try {
      const result = await flyersApi.getAll();
      if (result.ok) {
        const flyers = result.data;
        const currentIndex = flyers.findIndex((f) => f.id === flyerId);
        
        if (currentIndex !== -1) {
          setAdjacentFlyers({
            prev: currentIndex > 0 ? flyers[currentIndex - 1] : null,
            next: currentIndex < flyers.length - 1 ? flyers[currentIndex + 1] : null,
          });
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

  async function loadFlyer() {
    if (!flyerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await flyersApi.getById(flyerId);

      if (result.ok) {
        setFlyer(result.data);
      } else {
        setError(result.error.message || "Failed to load flyer");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
      const originalValue = extraction[key as keyof typeof extraction] ?? '';
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
      const originalValue = extraction[fieldKey as keyof typeof extraction] ?? '';
      if (value !== originalValue) {
        updateData[fieldKey] = value.trim() || null;
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

  const handleGenerateImages = async () => {
    if (!flyerId || !flyer?.information_extraction) return;

    setIsGeneratingImages(true);
    setError(null);

    try {
      const result = await flyersApi.generateImages(flyerId);

      if (result.ok) {
        // Poll for images - check every 3 seconds up to 60 times (3 minutes max)
        // Image generation can take 30-90 seconds for multiple images
        const maxAttempts = 60;
        const pollInterval = 3000; // 3 seconds
        let attempts = 0;
        
        // Clear any existing polling timeout
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
        
        const pollForImages = () => {
          attempts++;
          flyersApi.getById(flyerId).then((pollResult) => {
            if (pollResult.ok && pollResult.data.generated_images && pollResult.data.generated_images.length > 0) {
              // Images are ready
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              setFlyer(pollResult.data);
              setIsGeneratingImages(false);
            } else if (attempts < maxAttempts) {
              // Continue polling
              pollingTimeoutRef.current = setTimeout(pollForImages, pollInterval);
            } else {
              // Give up after max attempts (3 minutes)
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              setIsGeneratingImages(false);
              // Still reload to get latest state
              loadFlyer();
              // Show a message that it's taking longer than expected
              setError("Image generation is taking longer than expected. Please refresh the page to check for images.");
            }
          }).catch(() => {
            // On error, stop polling but continue checking
            if (attempts < maxAttempts) {
              // Retry on error (network issues, etc.)
              pollingTimeoutRef.current = setTimeout(pollForImages, pollInterval);
            } else {
              // Give up after max attempts
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              setIsGeneratingImages(false);
            }
          });
        };
        
        // Start polling after initial delay
        pollingTimeoutRef.current = setTimeout(pollForImages, pollInterval);
      } else {
        setError(result.error.message || "Failed to generate images");
        setIsGeneratingImages(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsGeneratingImages(false);
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
          <BackButton />
          
          {/* Flyer Navigation */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px" 
          }}>
            {adjacentFlyers.prev && (
              <button
                onClick={() => router.push(`/flyers/${adjacentFlyers.prev!.id}`)}
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
                onClick={() => router.push(`/flyers/${adjacentFlyers.next!.id}`)}
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
              <FlyerImageCard imageUrl={flyer.cloudfront_url} alt={flyer.title} />

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
                  hasGeneratedImages={
                    flyer.generated_images !== null &&
                    flyer.generated_images !== undefined &&
                    flyer.generated_images.length > 0
                  }
                />
              </div>
            </div>

            {flyer.information_extraction?.status === "completed" && (
              <div style={{ marginTop: "24px" }}>
                <GeneratedImagesSection
                  images={flyer.generated_images}
                  isLoading={isGeneratingImages}
                  isGenerating={isGeneratingImages}
                />
                {flyer.generated_images && flyer.generated_images.length > 0 && (
                  <div style={{ marginTop: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <Button
                      onClick={() => router.push(`/flyers/${flyer.id}/instagram`)}
                      variant="primary"
                    >
                      Schedule Instagram Posts
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

