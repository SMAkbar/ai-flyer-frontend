"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { ImageCategorySection } from "./ImageCategorySection";
import { PostingOptionsCard } from "./PostingOptionsCard";
import { CarouselPreview } from "./CarouselPreview";
import { instagramApi, type InstagramCarouselPostRead } from "@/lib/api/instagram";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import { Card } from "@/components/ui/Card";
import type { GeneratedImageType, FlyerGeneratedImage } from "@/lib/api/flyers";

type InstagramSchedulingPageProps = {
  flyer: FlyerDetailRead;
  onBack: () => void;
};

export function InstagramSchedulingPage({
  flyer,
  onBack,
}: InstagramSchedulingPageProps) {
  const [selectedCombinedImageId, setSelectedCombinedImageId] = useState<number | null>(null);

  // State for posting options (shared caption and hashtags for carousel)
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  // Single posting mode for carousel (not per-image)
  const [postingMode, setPostingMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState<string>(
    new Date().toISOString()
  );

  // State for carousel post
  const [carouselPost, setCarouselPost] = useState<InstagramCarouselPostRead | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generatedImages = flyer.generated_images || [];

  // Load carousel post on mount
  useEffect(() => {
    loadCarouselPost();
    generateDefaultCaption();
  }, [flyer]);

  // Helper to format ISO date string to display format (e.g., "15 January 2025")
  function formatDateForCaption(isoDate: string | null | undefined): string | null {
    if (!isoDate) return null;
    try {
      const date = new Date(isoDate + "T00:00:00");  // Parse as local date
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }

  // Auto-generate caption from extraction data
  function generateDefaultCaption() {
    const parts: string[] = [];

    if (flyer.information_extraction) {
      const extraction = flyer.information_extraction;

      if (extraction.event_title) {
        parts.push(extraction.event_title);
      }

      const formattedDate = formatDateForCaption(extraction.event_date);
      if (formattedDate) {
        parts.push(`📅 ${formattedDate}`);
      }

      if (extraction.location_town_city) {
        parts.push(`📍 ${extraction.location_town_city}`);
      }

      if (extraction.venue_name) {
        parts.push(`🏢 ${extraction.venue_name}`);
      }

      if (extraction.performers_djs_soundsystems) {
        parts.push(`🎵 ${extraction.performers_djs_soundsystems}`);
      }
    }

    // Always add collaboration credit at the end
    parts.push("Proudly promoting dub events in collaboration with @dubcentralsoundsystem 🤝🔊");

    // Add website url at the end
    parts.push("https://dubevents.club/");

    setCaption(parts.join("\n\n"));
  }

  async function loadCarouselPost() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.getCarousel(flyer.id);

      if (result.ok) {
        const post = result.data;
        setCarouselPost(post);

        // Restore selected images from carousel post
        if (post.post_status !== "posted") {
          setSelectedCombinedImageId(post.combined_image_id ?? null);

          if (post.scheduled_at) {
            setScheduledAt(post.scheduled_at);
            setPostingMode("schedule");
          }

          if (post.caption) {
            setCaption(post.caption);
          }
          if (post.hashtags) {
            setHashtags(post.hashtags);
          }
        }
      } else {
        // 404 is expected if no carousel post exists yet
        if (result.error.status !== 404) {
          setError(result.error.message || "Failed to load carousel post");
        }
      }
    } catch (err) {
      console.error("Error loading carousel post:", err);
      // Don't show error for 404 (no carousel post yet)
      if (err instanceof Error && !err.message.includes("404")) {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectCombined(imageId: number) {
    setSelectedCombinedImageId(imageId);
  }

  async function handleSubmit() {
    if (!selectedCombinedImageId) {
      setError("Please select a combined promotional image for the first carousel slide");
      return;
    }
    if (!flyer.cloudfront_url) {
      setError("This flyer has no image URL; cannot build the carousel");
      return;
    }

    // Validate caption length
    if (caption.length > 2200) {
      setError("Caption must be 2,200 characters or less");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const scheduledDateTime = postingMode === "now" 
        ? new Date(Date.now() - 60000).toISOString() // 1 minute ago
        : scheduledAt;

      const result = await instagramApi.scheduleCarousel(flyer.id, {
        combined_image_id: selectedCombinedImageId,
        // Legacy fields kept in the payload (sent as null) so the previous
        // 3-image workflow can be restored without an API change. The UI for
        // selecting these images is hidden today.
        time_date_image_id: null,
        performers_image_id: null,
        location_image_id: null,
        scheduled_at: scheduledDateTime,
        caption: caption || null,
        hashtags: hashtags || null,
      });

      if (!result.ok) {
        setError(result.error.message || "Failed to schedule carousel post");
        return;
      }

      setCarouselPost(result.data);

      if (postingMode === "now") {
        setSuccess("Carousel post is being published now!");
      } else {
        const scheduledTime = new Date(scheduledDateTime).toLocaleString();
        setSuccess(`Carousel post scheduled for: ${scheduledTime}`);
      }

      // Reload to get updated status
      try {
        await loadCarouselPost();
      } catch (err) {
        console.error("Error reloading carousel post:", err);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelCarousel() {
    setIsCanceling(true);
    setError(null);

    try {
      const result = await instagramApi.cancelCarousel(flyer.id);

      if (result.ok) {
        setSuccess("Carousel post canceled successfully");
        setCarouselPost(null);
        // Reset selections
        setSelectedCombinedImageId(null);
        setPostingMode("now");
      } else {
        setError(result.error.message || "Failed to cancel carousel post");
      }
    } catch (err) {
      console.error("Error canceling carousel:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsCanceling(false);
    }
  }

  async function handleRescheduleFailedCarousel() {
    setIsRescheduling(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await instagramApi.rescheduleFailedCarousel(flyer.id);

      if (result.ok) {
        setCarouselPost(null);
        setSelectedCombinedImageId(null);
        setHashtags("");
        setPostingMode("now");
        generateDefaultCaption();
        setSuccess("Failed carousel reset. Please select images and schedule again.");
      } else {
        setError(result.error.message || "Failed to reset failed carousel post");
      }
    } catch (err) {
      console.error("Error resetting failed carousel:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsRescheduling(false);
    }
  }

  const selectedCombinedImage =
    generatedImages.find((img) => img.id === selectedCombinedImageId) || null;
  const originalFlyerImage: FlyerGeneratedImage | null = flyer.cloudfront_url
    ? {
        id: 0,
        flyer_id: flyer.id,
        image_type: "performers" as GeneratedImageType,
        cloudfront_url: flyer.cloudfront_url,
        generation_status: "generated",
        generation_error: null,
        created_at: flyer.created_at,
        updated_at: flyer.created_at,
      }
    : null;

  const isCarouselPosted = carouselPost?.post_status === "posted";

  const readyToSchedule =
    Boolean(selectedCombinedImageId) && Boolean(flyer.cloudfront_url);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Schedule Instagram Carousel Post
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: tokens.textSecondary,
            margin: 0,
          }}
        >
          Choose a combined promotional image for the first slide; the original flyer is the second slide.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" style={{ marginBottom: "0" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" style={{ marginBottom: "0" }}>
          {success}
        </Alert>
      )}

      {/* Original Flyer Image Section (Read-only) */}
      <Card style={{ padding: "24px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "16px",
          }}
        >
          Original Flyer
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: tokens.textSecondary,
            marginBottom: "16px",
          }}
        >
          This image is always the second slide in your carousel
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          {flyer.cloudfront_url ? (
            <div
              style={{
                position: "relative",
                width: "200px",
                aspectRatio: "1",
                borderRadius: "12px",
                overflow: "hidden",
                border: `3px solid ${tokens.accent}`,
                boxShadow: `0 0 0 3px ${tokens.accent}40`,
                backgroundColor: "#000",
              }}
            >
              <img
                src={flyer.cloudfront_url}
                alt="Original Flyer"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  backgroundColor: tokens.accent,
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Selected
              </div>
            </div>
          ) : (
            <div
              style={{
                width: "200px",
                aspectRatio: "1",
                borderRadius: "12px",
                backgroundColor: tokens.bgHover,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: tokens.textSecondary,
                fontSize: "14px",
              }}
            >
              No image available
            </div>
          )}
        </div>
      </Card>

      <ImageCategorySection
        categoryType="combined"
        categoryLabel="Combined"
        images={generatedImages}
        selectedImageId={selectedCombinedImageId}
        onSelectImage={handleSelectCombined}
        disabled={isSubmitting || isCarouselPosted}
        postedImageIds={new Set()}
        isPosted={false}
      />

      {readyToSchedule && (
        <CarouselPreview
          combinedImage={selectedCombinedImage}
          originalFlyerImage={originalFlyerImage}
        />
      )}

      {readyToSchedule && !carouselPost && (
        <PostingOptionsCard
          caption={caption}
          hashtags={hashtags}
          scheduledAt={scheduledAt}
          postingMode={postingMode}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          onScheduledAtChange={setScheduledAt}
          onPostingModeChange={setPostingMode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isLoading}
          categoryLabel="Carousel"
          scheduleSelectionTitle={flyer.title}
        />
      )}

      {/* Carousel Post Status */}
      {carouselPost && (
        <div
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: tokens.textPrimary,
                margin: 0,
              }}
            >
              Carousel Post Status
            </h3>
            {carouselPost.post_status === "failed" && (
              <button
                onClick={handleRescheduleFailedCarousel}
                disabled={isRescheduling}
                style={{
                  padding: "8px 16px",
                  backgroundColor: tokens.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isRescheduling ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {isRescheduling ? "Rescheduling..." : "Reschedule instagram post"}
              </button>
            )}
            {carouselPost.post_status === "scheduled" && !isCanceling && (
              <button
                onClick={handleCancelCarousel}
                disabled={isCanceling}
                style={{
                  padding: "8px 16px",
                  backgroundColor: tokens.danger,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isCanceling ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
              }}
            >
              <span style={{ color: tokens.textSecondary }}>Status:</span>
              <span
                style={{
                  color:
                    carouselPost.post_status === "posted"
                      ? tokens.success
                      : carouselPost.post_status === "failed"
                      ? tokens.danger
                      : tokens.textPrimary,
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {carouselPost.post_status}
              </span>
            </div>
            {carouselPost.scheduled_at && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: tokens.textSecondary }}>Scheduled:</span>
                <span style={{ color: tokens.textPrimary }}>
                  {new Date(carouselPost.scheduled_at).toLocaleString()}
                </span>
              </div>
            )}
            {carouselPost.posted_at && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: tokens.textSecondary }}>Posted:</span>
                <span style={{ color: tokens.textPrimary }}>
                  {new Date(carouselPost.posted_at).toLocaleString()}
                </span>
              </div>
            )}
            {carouselPost.instagram_post_id && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: tokens.textSecondary }}>Instagram Post ID:</span>
                <span style={{ color: tokens.textPrimary, fontFamily: "monospace" }}>
                  {carouselPost.instagram_post_id}
                </span>
              </div>
            )}
            {carouselPost.post_error && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: tokens.danger + "20",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: tokens.danger,
                }}
              >
                Error: {carouselPost.post_error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
