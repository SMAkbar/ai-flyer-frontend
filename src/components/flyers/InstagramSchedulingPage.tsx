"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { ImageCategorySection } from "./ImageCategorySection";
import { PostingOptionsCard } from "./PostingOptionsCard";
import { ScheduledPostsCard } from "./ScheduledPostsCard";
import { instagramApi, type ScheduledPostWithFlyerRead } from "@/lib/api/instagram";
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

  // State for posting options (shared caption and hashtags)
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  // State for per-image scheduling (one per category)
  const [timeDatePostingMode, setTimeDatePostingMode] = useState<"now" | "schedule">("now");
  const [timeDateScheduledAt, setTimeDateScheduledAt] = useState<string>(
    new Date().toISOString()
  );
  const [performersPostingMode, setPerformersPostingMode] = useState<"now" | "schedule">("now");
  const [performersScheduledAt, setPerformersScheduledAt] = useState<string>(
    new Date().toISOString()
  );
  const [locationPostingMode, setLocationPostingMode] = useState<"now" | "schedule">("now");
  const [locationScheduledAt, setLocationScheduledAt] = useState<string>(
    new Date().toISOString()
  );

  // State for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostWithFlyerRead[]>([]);

  // State for tracking which images have been posted
  const [postedImageIds, setPostedImageIds] = useState<Set<number>>(new Set());
  const [postedCategories, setPostedCategories] = useState<Set<GeneratedImageType>>(new Set());
  const [recentlyPostedCategory, setRecentlyPostedCategory] = useState<GeneratedImageType | null>(null);

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

        // Track posted images and categories
        const postedIds = new Set<number>();
        const postedCats = new Set<GeneratedImageType>();

        // Use flyer.generated_images directly (generatedImages is defined later)
        const generatedImages = flyer.generated_images || [];

        // Restore selected images and scheduled times from existing posts
        result.data.scheduled_posts.forEach((post) => {
          // Include posts that are selected for posting OR already posted
          if (post.is_selected_for_posting || post.post_status === "posted") {
            postedIds.add(post.flyer_generated_image_id);
            
            // Find the image in generatedImages to get its type
            const image = generatedImages.find(img => img.id === post.flyer_generated_image_id);
            if (image) {
              postedCats.add(image.image_type);
              
              // Restore selected image ID for this category
              if (post.is_selected_for_posting && post.post_status !== "posted") {
                switch (image.image_type) {
                  case "time_date":
                    setSelectedTimeDateImageId(post.flyer_generated_image_id);
                    // Restore scheduled time if it exists
                    if (post.scheduled_at) {
                      setTimeDateScheduledAt(post.scheduled_at);
                      setTimeDatePostingMode("schedule");
                    }
                    break;
                  case "performers":
                    setSelectedPerformersImageId(post.flyer_generated_image_id);
                    if (post.scheduled_at) {
                      setPerformersScheduledAt(post.scheduled_at);
                      setPerformersPostingMode("schedule");
                    }
                    break;
                  case "location":
                    setSelectedLocationImageId(post.flyer_generated_image_id);
                    if (post.scheduled_at) {
                      setLocationScheduledAt(post.scheduled_at);
                      setLocationPostingMode("schedule");
                    }
                    break;
                }
                
                // Restore caption and hashtags from the first scheduled post (they're shared)
                if (post.caption) {
                  setCaption(post.caption);
                }
                if (post.hashtags) {
                  setHashtags(post.hashtags);
                }
              }
            }
          }
        });

        setPostedImageIds(postedIds);
        setPostedCategories(postedCats);
      } else {
        setError(result.error.message || "Failed to load scheduled posts");
      }
    } catch (err) {
      console.error("Error loading scheduled posts:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
    // Get all currently selected images from state (including already scheduled ones)
    // We need to include images that are already selected in the UI, even if they're already scheduled
    const currentlySelectedInUI = [
      selectedTimeDateImageId,
      selectedPerformersImageId,
      selectedLocationImageId,
    ].filter((id): id is number => id !== null);

    // Also get already scheduled images that aren't in UI state (from existing posts)
    const generatedImages = flyer.generated_images || [];
    const alreadyScheduledImageIds = new Set<number>();
    scheduledPosts.forEach((post) => {
      if (post.is_selected_for_posting && post.post_status !== "posted") {
        alreadyScheduledImageIds.add(post.flyer_generated_image_id);
      }
    });

    // Combine UI selections with already scheduled (to preserve them)
    const allSelectedImageIds = new Set([
      ...currentlySelectedInUI,
      ...Array.from(alreadyScheduledImageIds),
    ]);

    if (allSelectedImageIds.size === 0) {
      setError("Please select at least one image to post");
      return;
    }

    // Determine which images to select based on UI state
    // For categories with UI selections, use those; for others, keep existing if scheduled
    let timeDateToSelect = selectedTimeDateImageId;
    let performersToSelect = selectedPerformersImageId;
    let locationToSelect = selectedLocationImageId;

    // If a category doesn't have a UI selection but has a scheduled post, keep it
    if (!timeDateToSelect) {
      const scheduledTimeDate = scheduledPosts.find((post) => {
        if (!post.is_selected_for_posting || post.post_status === "posted") return false;
        const image = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
        return image?.image_type === "time_date";
      });
      if (scheduledTimeDate) {
        timeDateToSelect = scheduledTimeDate.flyer_generated_image_id;
      }
    }

    if (!performersToSelect) {
      const scheduledPerformers = scheduledPosts.find((post) => {
        if (!post.is_selected_for_posting || post.post_status === "posted") return false;
        const image = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
        return image?.image_type === "performers";
      });
      if (scheduledPerformers) {
        performersToSelect = scheduledPerformers.flyer_generated_image_id;
      }
    }

    if (!locationToSelect) {
      const scheduledLocation = scheduledPosts.find((post) => {
        if (!post.is_selected_for_posting || post.post_status === "posted") return false;
        const image = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
        return image?.image_type === "location";
      });
      if (scheduledLocation) {
        locationToSelect = scheduledLocation.flyer_generated_image_id;
      }
    }

    // Validate caption length
    if (caption.length > 2200) {
      setError("Caption must be 2,200 characters or less");
      return;
    }

    // Validate scheduled times if scheduling (only for newly selected images in UI)
    if (selectedTimeDateImageId && timeDatePostingMode === "schedule") {
      const scheduledDate = new Date(timeDateScheduledAt);
      if (scheduledDate <= new Date()) {
        setError("Time/Date image scheduled time must be in the future");
        return;
      }
    }
    if (selectedPerformersImageId && performersPostingMode === "schedule") {
      const scheduledDate = new Date(performersScheduledAt);
      if (scheduledDate <= new Date()) {
        setError("Performers image scheduled time must be in the future");
        return;
      }
    }
    if (selectedLocationImageId && locationPostingMode === "schedule") {
      const scheduledDate = new Date(locationScheduledAt);
      if (scheduledDate <= new Date()) {
        setError("Location image scheduled time must be in the future");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // First, select images (this will preserve existing selections)
      const selectResult = await instagramApi.selectImages(flyer.id, {
        time_date_image_id: timeDateToSelect,
        performers_image_id: performersToSelect,
        location_image_id: locationToSelect,
      });

      if (!selectResult.ok) {
        setError(selectResult.error.message || "Failed to select images");
        return;
      }

      // Then, schedule only the images that are newly selected in the UI
      // Don't re-schedule images that are already scheduled
      const schedulePromises = selectResult.data.selected_posts
        .filter((post) => {
          // Only schedule if this image is in the UI selection (newly selected)
          return currentlySelectedInUI.includes(post.flyer_generated_image_id);
        })
        .map((post) => {
          // Find the image to get its type
          const image = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
          if (!image) {
            throw new Error(`Image ${post.flyer_generated_image_id} not found`);
          }

          // Determine the schedule time based on image type
          let scheduledDateTime: string;
          if (image.image_type === "time_date") {
            scheduledDateTime = timeDatePostingMode === "now" 
              ? new Date().toISOString()
              : timeDateScheduledAt;
          } else if (image.image_type === "performers") {
            scheduledDateTime = performersPostingMode === "now" 
              ? new Date().toISOString()
              : performersScheduledAt;
          } else { // location
            scheduledDateTime = locationPostingMode === "now" 
              ? new Date().toISOString()
              : locationScheduledAt;
          }

          return instagramApi.schedulePost(flyer.id, {
            image_id: post.flyer_generated_image_id,
            scheduled_at: scheduledDateTime,
            caption: caption || null,
            hashtags: hashtags || null,
          });
        });

      // If there are no new images to schedule, just update the selection
      if (schedulePromises.length === 0) {
        setSuccess("Images selected successfully!");
        try {
          await loadScheduledPosts();
        } catch (err) {
          console.error("Error reloading scheduled posts:", err);
          // Don't show error to user since selection was successful
        }
        return;
      }

      const scheduleResults = await Promise.all(schedulePromises);

      const hasError = scheduleResults.some((result) => !result.ok);
      if (hasError) {
        const failedResult = scheduleResults.find((r) => !r.ok);
        const errorMessage = failedResult?.error?.message || "Failed to schedule some posts";
        console.error("Error scheduling posts:", failedResult?.error);
        setError(errorMessage);
      } else {
        // Track which images were just posted
        const newPostedIds = new Set(postedImageIds);
        const newPostedCats = new Set(postedCategories);
        let postedCategory: GeneratedImageType | null = null;

        selectResult.data.selected_posts
          .filter((post) => currentlySelectedInUI.includes(post.flyer_generated_image_id))
          .forEach((post) => {
            newPostedIds.add(post.flyer_generated_image_id);
            const img = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
            if (img) {
              newPostedCats.add(img.image_type);
              postedCategory = img.image_type; // Track the most recent one
            }
          });

        setPostedImageIds(newPostedIds);
        setPostedCategories(newPostedCats);
        setRecentlyPostedCategory(postedCategory);

        // Determine success message based on posting modes
        const newlyScheduledPosts = selectResult.data.selected_posts.filter((post) =>
          currentlySelectedInUI.includes(post.flyer_generated_image_id)
        );
        
        const allNow = scheduleResults.every((result, index) => {
          const post = newlyScheduledPosts[index];
          const image = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
          if (!image) return false;
          if (image.image_type === "time_date") return timeDatePostingMode === "now";
          if (image.image_type === "performers") return performersPostingMode === "now";
          return locationPostingMode === "now";
        });
        
        if (allNow) {
          setSuccess("Posts are being published now!");
        } else {
          const scheduledTimes = scheduleResults
            .map((result, index) => {
              const post = newlyScheduledPosts[index];
              const image = generatedImages.find((img) => img.id === post.flyer_generated_image_id);
              if (!image) return null;
              if (image.image_type === "time_date") {
                return timeDatePostingMode === "schedule" ? timeDateScheduledAt : null;
              }
              if (image.image_type === "performers") {
                return performersPostingMode === "schedule" ? performersScheduledAt : null;
              }
              return locationPostingMode === "schedule" ? locationScheduledAt : null;
            })
            .filter((time): time is string => time !== null)
            .map(time => new Date(time).toLocaleString());
          
          if (scheduledTimes.length > 0) {
            setSuccess(`Posts scheduled for: ${scheduledTimes.join(", ")}`);
          } else {
            setSuccess("Posts scheduled successfully!");
          }
        }
        
        // Reload scheduled posts
        try {
          await loadScheduledPosts();
        } catch (err) {
          console.error("Error reloading scheduled posts after scheduling:", err);
          // Don't override success message with error
        }
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
        try {
          await loadScheduledPosts();
        } catch (err) {
          console.error("Error reloading scheduled posts after cancel:", err);
          // Don't override success message with error
        }
      } else {
        setError(result.error.message || "Failed to cancel post");
      }
    } catch (err) {
      console.error("Error canceling post:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

      {/* Image Category Sections with Scheduling */}
      <ImageCategorySection
        categoryType="time_date"
        categoryLabel="Time/Date"
        images={generatedImages}
        selectedImageId={selectedTimeDateImageId}
        onSelectImage={(id) => handleSelectImage("time_date", id)}
        disabled={isSubmitting}
        postedImageIds={postedImageIds}
        isPosted={postedCategories.has("time_date")}
      />
      {selectedTimeDateImageId && !postedCategories.has("time_date") && (
        <PostingOptionsCard
          caption={caption}
          hashtags={hashtags}
          scheduledAt={timeDateScheduledAt}
          postingMode={timeDatePostingMode}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          onScheduledAtChange={setTimeDateScheduledAt}
          onPostingModeChange={setTimeDatePostingMode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isLoading}
          categoryLabel="Time/Date"
        />
      )}

      <ImageCategorySection
        categoryType="performers"
        categoryLabel="Performers"
        images={generatedImages}
        selectedImageId={selectedPerformersImageId}
        onSelectImage={(id) => handleSelectImage("performers", id)}
        disabled={isSubmitting}
        postedImageIds={postedImageIds}
        isPosted={postedCategories.has("performers")}
      />
      {selectedPerformersImageId && !postedCategories.has("performers") && (
        <PostingOptionsCard
          caption={caption}
          hashtags={hashtags}
          scheduledAt={performersScheduledAt}
          postingMode={performersPostingMode}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          onScheduledAtChange={setPerformersScheduledAt}
          onPostingModeChange={setPerformersPostingMode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isLoading}
          categoryLabel="Performers"
        />
      )}

      <ImageCategorySection
        categoryType="location"
        categoryLabel="Location"
        images={generatedImages}
        selectedImageId={selectedLocationImageId}
        onSelectImage={(id) => handleSelectImage("location", id)}
        disabled={isSubmitting}
        postedImageIds={postedImageIds}
        isPosted={postedCategories.has("location")}
      />
      {selectedLocationImageId && !postedCategories.has("location") && (
        <PostingOptionsCard
          caption={caption}
          hashtags={hashtags}
          scheduledAt={locationScheduledAt}
          postingMode={locationPostingMode}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          onScheduledAtChange={setLocationScheduledAt}
          onPostingModeChange={setLocationPostingMode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isLoading}
          categoryLabel="Location"
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

