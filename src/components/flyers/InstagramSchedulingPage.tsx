"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { ImageCategorySection } from "./ImageCategorySection";
import { PostingOptionsCard } from "./PostingOptionsCard";
import { ScheduledPostsCard } from "./ScheduledPostsCard";
import { instagramApi, type ScheduledPostRead } from "@/lib/api/instagram";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import type { GeneratedImageType } from "@/lib/api/flyers";

type InstagramSchedulingPageProps = {
  flyer: FlyerDetailRead;
  onBack: () => void;
};

export function InstagramSchedulingPage({
  flyer,
  onBack,
}: InstagramSchedulingPageProps) {
  // State for selected images (one per category)
  const [selectedTimeDateImageId, setSelectedTimeDateImageId] = useState<number | null>(null);
  const [selectedPerformersImageId, setSelectedPerformersImageId] = useState<number | null>(null);
  const [selectedLocationImageId, setSelectedLocationImageId] = useState<number | null>(null);

  // State for posting options
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>(
    new Date().toISOString()
  );
  const [postingMode, setPostingMode] = useState<"now" | "schedule">("now");

  // State for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostRead[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load scheduled posts on mount
  useEffect(() => {
    loadScheduledPosts();
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

    if (extraction.event_date_time) {
      parts.push(`📅 ${extraction.event_date_time}`);
    }

    if (extraction.location_town_city) {
      parts.push(`📍 ${extraction.location_town_city}`);
    }

    if (extraction.performers_djs_soundsystems) {
      parts.push(`🎵 ${extraction.performers_djs_soundsystems}`);
    }

    setCaption(parts.join("\n\n"));
  }

  async function loadScheduledPosts() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.getScheduledPosts(flyer.id);

      if (result.ok) {
        setScheduledPosts(result.data.scheduled_posts);

        // Pre-select images that are already scheduled
        result.data.scheduled_posts.forEach((post) => {
          if (post.is_selected_for_posting) {
            switch (post.image_type) {
              case "time_date":
                setSelectedTimeDateImageId(post.id);
                break;
              case "performers":
                setSelectedPerformersImageId(post.id);
                break;
              case "location":
                setSelectedLocationImageId(post.id);
                break;
            }
          }
        });
      } else {
        setError(result.error.message || "Failed to load scheduled posts");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectImage(category: GeneratedImageType, imageId: number) {
    switch (category) {
      case "time_date":
        setSelectedTimeDateImageId(imageId);
        break;
      case "performers":
        setSelectedPerformersImageId(imageId);
        break;
      case "location":
        setSelectedLocationImageId(imageId);
        break;
    }
  }

  async function handleSubmit() {
    // Validate at least one image is selected
    const selectedImages = [
      selectedTimeDateImageId,
      selectedPerformersImageId,
      selectedLocationImageId,
    ].filter((id): id is number => id !== null);

    if (selectedImages.length === 0) {
      setError("Please select at least one image to post");
      return;
    }

    // Validate caption length
    if (caption.length > 2200) {
      setError("Caption must be 2,200 characters or less");
      return;
    }

    // Validate scheduled time if scheduling
    if (postingMode === "schedule") {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        setError("Scheduled time must be in the future");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // First, select images
      const selectResult = await instagramApi.selectImages(flyer.id, {
        time_date_image_id: selectedTimeDateImageId,
        performers_image_id: selectedPerformersImageId,
        location_image_id: selectedLocationImageId,
      });

      if (!selectResult.ok) {
        setError(selectResult.error.message || "Failed to select images");
        return;
      }

      // Then, schedule each selected image
      const scheduledDateTime = postingMode === "now" 
        ? new Date().toISOString()
        : scheduledAt;

      const schedulePromises = selectResult.data.selected_images.map((image) =>
        instagramApi.schedulePost(flyer.id, {
          image_id: image.id,
          scheduled_at: scheduledDateTime,
          caption: caption || null,
          hashtags: hashtags || null,
        })
      );

      const scheduleResults = await Promise.all(schedulePromises);

      const hasError = scheduleResults.some((result) => !result.ok);
      if (hasError) {
        const errorMessage = scheduleResults.find((r) => !r.ok)?.error.message;
        setError(errorMessage || "Failed to schedule some posts");
      } else {
        setSuccess(
          postingMode === "now"
            ? "Posts are being published now!"
            : `Posts scheduled for ${new Date(scheduledDateTime).toLocaleString()}`
        );
        
        // Reload scheduled posts
        await loadScheduledPosts();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelPost(imageId: number) {
    setIsCanceling(imageId);
    setError(null);

    try {
      const result = await instagramApi.cancelScheduledPost(flyer.id, imageId);

      if (result.ok) {
        setSuccess("Post canceled successfully");
        await loadScheduledPosts();
      } else {
        setError(result.error.message || "Failed to cancel post");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsCanceling(null);
    }
  }

  const generatedImages = flyer.generated_images || [];

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
          Schedule Instagram Posts
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: tokens.textSecondary,
            margin: 0,
          }}
        >
          Select images from each category and schedule them for posting on Instagram
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
        disabled={isSubmitting}
      />

      <ImageCategorySection
        categoryType="performers"
        categoryLabel="Performers"
        images={generatedImages}
        selectedImageId={selectedPerformersImageId}
        onSelectImage={(id) => handleSelectImage("performers", id)}
        disabled={isSubmitting}
      />

      <ImageCategorySection
        categoryType="location"
        categoryLabel="Location"
        images={generatedImages}
        selectedImageId={selectedLocationImageId}
        onSelectImage={(id) => handleSelectImage("location", id)}
        disabled={isSubmitting}
      />

      {/* Posting Options */}
      {(selectedTimeDateImageId ||
        selectedPerformersImageId ||
        selectedLocationImageId) && (
        <PostingOptionsCard
          caption={caption}
          hashtags={hashtags}
          scheduledAt={scheduledAt}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          onScheduledAtChange={setScheduledAt}
          onPostingModeChange={setPostingMode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isLoading}
        />
      )}

      {/* Scheduled Posts */}
      <ScheduledPostsCard
        posts={scheduledPosts}
        onCancelPost={handleCancelPost}
        isCanceling={isCanceling}
      />
    </div>
  );
}

