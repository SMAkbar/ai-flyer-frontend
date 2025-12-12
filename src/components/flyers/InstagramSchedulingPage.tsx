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
  // State for selected images (Date and Location only - Performers is replaced by original flyer)
  const [selectedTimeDateImageId, setSelectedTimeDateImageId] = useState<number | null>(null);
  const [selectedLocationImageId, setSelectedLocationImageId] = useState<number | null>(null);

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generatedImages = flyer.generated_images || [];

  // Load carousel post on mount
  useEffect(() => {
    loadCarouselPost();
    generateDefaultCaption();
  }, [flyer]);

  // Auto-generate caption from extraction data
  function generateDefaultCaption() {
    if (!flyer.information_extraction) return;

    const extraction = flyer.information_extraction;
    const parts: string[] = [];

    if (extraction.event_title) {
      parts.push(extraction.event_title);
    }

    if (extraction.event_date) {
      parts.push(`📅 ${extraction.event_date}`);
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
          setSelectedTimeDateImageId(post.time_date_image_id);
          // performers_image_id is no longer used - we use original flyer image
          setSelectedLocationImageId(post.location_image_id);

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

  function handleSelectImage(category: GeneratedImageType, imageId: number) {
    switch (category) {
      case "time_date":
        setSelectedTimeDateImageId(imageId);
        break;
      case "location":
        setSelectedLocationImageId(imageId);
        break;
    }
  }

  async function handleSubmit() {
    // Validate Date and Location images are selected
    if (!selectedTimeDateImageId || !selectedLocationImageId) {
      setError("Please select one image from Date and Location categories");
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
      // Schedule carousel post (performers_image_id is null to use original flyer)
      // For "now", set to 1 minute in the past so cron job picks it up immediately
      const scheduledDateTime = postingMode === "now" 
        ? new Date(Date.now() - 60000).toISOString() // 1 minute ago
        : scheduledAt;

      const result = await instagramApi.scheduleCarousel(flyer.id, {
        time_date_image_id: selectedTimeDateImageId,
        performers_image_id: null,  // Use original flyer image
        location_image_id: selectedLocationImageId,
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
        setSelectedTimeDateImageId(null);
        setSelectedLocationImageId(null);
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

  // Get selected image objects for preview
  const selectedTimeDateImage = generatedImages.find(
    (img) => img.id === selectedTimeDateImageId
  ) || null;
  // Original flyer image is used for the middle slide
  const originalFlyerImage: FlyerGeneratedImage | null = flyer.cloudfront_url ? {
    id: 0,  // Special ID for original flyer
    flyer_id: flyer.id,
    image_type: "performers" as GeneratedImageType,
    cloudfront_url: flyer.cloudfront_url,
    generation_status: "generated",
    generation_error: null,
    created_at: flyer.created_at,
    updated_at: flyer.created_at,
  } : null;
  const selectedLocationImage = generatedImages.find(
    (img) => img.id === selectedLocationImageId
  ) || null;

  // Check if carousel is posted
  const isCarouselPosted = carouselPost?.post_status === "posted";

  // Check if all images are selected (Date and Location required, original flyer is always used)
  const allImagesSelected = selectedTimeDateImageId && selectedLocationImageId;

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
          Select one image from each category to create a swipeable carousel post on Instagram
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

      {/* Image Category Sections */}
      <ImageCategorySection
        categoryType="time_date"
        categoryLabel="Time/Date"
        images={generatedImages}
        selectedImageId={selectedTimeDateImageId}
        onSelectImage={(id) => handleSelectImage("time_date", id)}
        disabled={isSubmitting || isCarouselPosted}
        postedImageIds={new Set()}
        isPosted={false}
      />

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
          This image will be used as the second slide in your carousel
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
              }}
            >
              <img
                src={flyer.cloudfront_url}
                alt="Original Flyer"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
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
        categoryType="location"
        categoryLabel="Location"
        images={generatedImages}
        selectedImageId={selectedLocationImageId}
        onSelectImage={(id) => handleSelectImage("location", id)}
        disabled={isSubmitting || isCarouselPosted}
        postedImageIds={new Set()}
        isPosted={false}
      />

      {/* Carousel Preview */}
      {allImagesSelected && (
        <CarouselPreview
          timeDateImage={selectedTimeDateImage}
          performersImage={originalFlyerImage}
          locationImage={selectedLocationImage}
        />
      )}

      {/* Posting Options - Only show if all images selected and no carousel post exists yet */}
      {allImagesSelected && !carouselPost && (
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
