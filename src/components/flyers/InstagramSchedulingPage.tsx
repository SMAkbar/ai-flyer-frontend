"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { ImageCategorySection } from "./ImageCategorySection";
import { PostingOptionsCard } from "./PostingOptionsCard";
import { CarouselPreview } from "./CarouselPreview";
import { StoryPreview } from "./StoryPreview";
import {
  instagramApi,
  type InstagramCarouselPostRead,
  type InstagramStoryPostRead,
  type InstagramPostType,
} from "@/lib/api/instagram";
import type { FlyerDetailRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { GeneratedImageType, FlyerGeneratedImage } from "@/lib/api/flyers";

type InstagramSchedulingPageProps = {
  flyer: FlyerDetailRead;
  onClose: () => void;
  embedded?: boolean;
};

const POST_TYPE_OPTIONS: { value: InstagramPostType; label: string }[] = [
  { value: "story_and_feed", label: "Story + Feed" },
  { value: "feed", label: "Feed" },
  { value: "story", label: "Story" },
];

function inferPostType(
  carousel: InstagramCarouselPostRead | null,
  story: InstagramStoryPostRead | null
): InstagramPostType {
  if (carousel && story) {
    return "story_and_feed";
  }
  if (story) {
    return "story";
  }
  return "feed";
}

function postTypeDescription(postType: InstagramPostType): string {
  switch (postType) {
    case "story_and_feed":
      return "Post a story with the original flyer and a carousel feed with your combined image.";
    case "feed":
      return "Choose a combined promotional image for the first slide; the original flyer is the second slide.";
    case "story":
      return "Post the original flyer as an Instagram story with a centered card layout.";
  }
}

function postTypeHeading(postType: InstagramPostType): string {
  switch (postType) {
    case "story_and_feed":
      return "Schedule Instagram Story + Feed";
    case "feed":
      return "Schedule Instagram Feed Post";
    case "story":
      return "Schedule Instagram Story";
  }
}

export function InstagramSchedulingPage({
  flyer,
  onClose,
  embedded = false,
}: InstagramSchedulingPageProps) {
  const [postType, setPostType] = useState<InstagramPostType>("feed");
  const [selectedCombinedImageId, setSelectedCombinedImageId] = useState<number | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [postingMode, setPostingMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState<string>(new Date().toISOString());
  const [carouselPost, setCarouselPost] = useState<InstagramCarouselPostRead | null>(null);
  const [storyPost, setStoryPost] = useState<InstagramStoryPostRead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelingCarousel, setIsCancelingCarousel] = useState(false);
  const [isCancelingStory, setIsCancelingStory] = useState(false);
  const [isReschedulingCarousel, setIsReschedulingCarousel] = useState(false);
  const [isReschedulingStory, setIsReschedulingStory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generatedImages = flyer.generated_images || [];

  useEffect(() => {
    void loadInstagramPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: flyer.id only
  }, [flyer.id]);

  function formatDateForCaption(isoDate: string | null | undefined): string | null {
    if (!isoDate) return null;
    try {
      const date = new Date(isoDate + "T00:00:00");
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }

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

      if (extraction.country) {
        parts.push(`🌍 ${extraction.country}`);
      }

      if (extraction.performers_djs_soundsystems) {
        parts.push(`🎵 ${extraction.performers_djs_soundsystems}`);
      }
    }

    parts.push("Proudly promoting dub events in collaboration with @dubcentralsoundsystem 🤝🔊");
    parts.push("Website link in bio 🔗");

    setCaption(parts.join("\n\n"));
  }

  async function loadInstagramPosts() {
    setIsLoading(true);
    setError(null);

    try {
      const [carouselResult, storyResult] = await Promise.all([
        instagramApi.getCarousel(flyer.id),
        instagramApi.getStory(flyer.id),
      ]);

      let loadedCarousel: InstagramCarouselPostRead | null = null;
      let loadedStory: InstagramStoryPostRead | null = null;

      if (carouselResult.ok) {
        loadedCarousel = carouselResult.data;
        setCarouselPost(loadedCarousel);

        if (loadedCarousel.post_status !== "posted") {
          setSelectedCombinedImageId(loadedCarousel.combined_image_id ?? null);
          if (loadedCarousel.scheduled_at) {
            setScheduledAt(loadedCarousel.scheduled_at);
            setPostingMode("schedule");
          }
          if (loadedCarousel.caption) {
            setCaption(loadedCarousel.caption);
          } else {
            generateDefaultCaption();
          }
          if (loadedCarousel.hashtags) {
            setHashtags(loadedCarousel.hashtags);
          }
        }
      } else if (carouselResult.error.status !== 404) {
        setError(carouselResult.error.message || "Failed to load carousel post");
      } else {
        generateDefaultCaption();
      }

      if (storyResult.ok) {
        loadedStory = storyResult.data;
        setStoryPost(loadedStory);

        if (loadedStory.post_status !== "posted" && loadedStory.scheduled_at) {
          setScheduledAt(loadedStory.scheduled_at);
          setPostingMode("schedule");
        }
      } else if (storyResult.error.status !== 404) {
        setError(storyResult.error.message || "Failed to load story post");
      }

      setPostType(inferPostType(loadedCarousel, loadedStory));
    } catch (err) {
      console.error("Error loading Instagram posts:", err);
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
    if (!flyer.cloudfront_url) {
      setError("This flyer has no image URL");
      return;
    }

    if (postType !== "story" && !selectedCombinedImageId) {
      setError("Please select a combined promotional image for the feed carousel");
      return;
    }

    if (postType !== "story" && caption.length > 2200) {
      setError("Caption must be 2,200 characters or less");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const scheduledDateTime =
      postingMode === "now"
        ? new Date(Date.now() - 60000).toISOString()
        : scheduledAt;

    try {
      if (postType === "feed") {
        const result = await instagramApi.scheduleCarousel(flyer.id, {
          combined_image_id: selectedCombinedImageId!,
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
        setSuccess(
          postingMode === "now"
            ? "Carousel post is being published now!"
            : `Carousel post scheduled for: ${new Date(scheduledDateTime).toLocaleString()}`
        );
      } else if (postType === "story") {
        const result = await instagramApi.scheduleStory(flyer.id, {
          scheduled_at: scheduledDateTime,
        });

        if (!result.ok) {
          setError(result.error.message || "Failed to schedule story post");
          return;
        }

        setStoryPost(result.data);
        setSuccess(
          postingMode === "now"
            ? "Story is being published now!"
            : `Story scheduled for: ${new Date(scheduledDateTime).toLocaleString()}`
        );
      } else {
        const result = await instagramApi.scheduleStoryAndFeed(flyer.id, {
          combined_image_id: selectedCombinedImageId!,
          scheduled_at: scheduledDateTime,
          caption: caption || null,
          hashtags: hashtags || null,
        });

        if (!result.ok) {
          setError(result.error.message || "Failed to schedule story and feed");
          return;
        }

        setStoryPost(result.data.story_post);
        setCarouselPost(result.data.carousel_post);
        setSuccess(
          postingMode === "now"
            ? "Story and feed are being published now!"
            : `Story and feed scheduled for: ${new Date(scheduledDateTime).toLocaleString()}`
        );
      }

      await loadInstagramPosts();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelCarousel() {
    setIsCancelingCarousel(true);
    setError(null);

    try {
      const result = await instagramApi.cancelCarousel(flyer.id);
      if (result.ok) {
        setSuccess("Feed post canceled successfully");
        setCarouselPost(null);
        setSelectedCombinedImageId(null);
        if (!storyPost) {
          setPostingMode("now");
        }
      } else {
        setError(result.error.message || "Failed to cancel carousel post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsCancelingCarousel(false);
    }
  }

  async function handleCancelStory() {
    setIsCancelingStory(true);
    setError(null);

    try {
      const result = await instagramApi.cancelStory(flyer.id);
      if (result.ok) {
        setSuccess("Story canceled successfully");
        setStoryPost(null);
        if (!carouselPost) {
          setPostingMode("now");
        }
      } else {
        setError(result.error.message || "Failed to cancel story post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsCancelingStory(false);
    }
  }

  async function handleRescheduleFailedCarousel() {
    setIsReschedulingCarousel(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await instagramApi.rescheduleFailedCarousel(flyer.id);
      if (result.ok) {
        setCarouselPost(null);
        setSelectedCombinedImageId(null);
        setHashtags("");
        generateDefaultCaption();
        setSuccess("Failed feed post reset. Please schedule again.");
      } else {
        setError(result.error.message || "Failed to reset failed carousel post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsReschedulingCarousel(false);
    }
  }

  async function handleRescheduleFailedStory() {
    setIsReschedulingStory(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await instagramApi.rescheduleFailedStory(flyer.id);
      if (result.ok) {
        setStoryPost(null);
        setSuccess("Failed story reset. Please schedule again.");
      } else {
        setError(result.error.message || "Failed to reset failed story post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsReschedulingStory(false);
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

  const showFeedSections = postType === "feed" || postType === "story_and_feed";
  const showStorySections = postType === "story" || postType === "story_and_feed";
  const readyForFeed =
    Boolean(selectedCombinedImageId) && Boolean(flyer.cloudfront_url);
  const readyForStory = Boolean(flyer.cloudfront_url);
  const isCarouselPosted = carouselPost?.post_status === "posted";
  const isStoryPosted = storyPost?.post_status === "posted";

  const showPostingForm =
    (postType === "feed" && readyForFeed && !carouselPost) ||
    (postType === "story" && readyForStory && !storyPost) ||
    (postType === "story_and_feed" &&
      readyForFeed &&
      !carouselPost &&
      !storyPost);

  const allPosted =
    postType === "story_and_feed"
      ? isCarouselPosted && isStoryPosted
      : postType === "story"
      ? isStoryPosted
      : isCarouselPosted;

  const HeadingTag = embedded ? "h2" : "h1";
  const isBusy =
    isSubmitting ||
    isCancelingCarousel ||
    isCancelingStory ||
    isReschedulingCarousel ||
    isReschedulingStory;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginTop: embedded ? "24px" : undefined,
      }}
    >
      <div>
        <HeadingTag
          style={{
            fontSize: embedded ? "20px" : "28px",
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          {postTypeHeading(postType)}
        </HeadingTag>
        <p
          style={{
            fontSize: embedded ? "14px" : "16px",
            color: tokens.textSecondary,
            margin: 0,
          }}
        >
          {postTypeDescription(postType)}
        </p>
      </div>

      <Card style={{ padding: "20px 24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "12px",
          }}
        >
          Post type
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {POST_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: isBusy || isLoading ? "not-allowed" : "pointer",
                opacity: isBusy || isLoading ? 0.6 : 1,
              }}
            >
              <input
                type="radio"
                name="instagramPostType"
                value={option.value}
                checked={postType === option.value}
                onChange={() => setPostType(option.value)}
                disabled={isBusy || isLoading}
              />
              <span style={{ fontSize: "15px", color: tokens.textPrimary }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </Card>

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

      {!embedded && showFeedSections && (
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
            {postType === "story_and_feed"
              ? "Used as the story content and the second carousel slide"
              : "This image is always the second slide in your carousel"}
          </p>
          {flyer.cloudfront_url ? (
            <img
              src={flyer.cloudfront_url}
              alt="Original Flyer"
              style={{
                width: "200px",
                aspectRatio: "1",
                objectFit: "contain",
                borderRadius: "12px",
                border: `3px solid ${tokens.accent}`,
                backgroundColor: "#000",
              }}
            />
          ) : (
            <div style={{ color: tokens.textSecondary }}>No image available</div>
          )}
        </Card>
      )}

      {showFeedSections && (
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
      )}

      {showFeedSections && readyForFeed && (
        <CarouselPreview
          combinedImage={selectedCombinedImage}
          originalFlyerImage={originalFlyerImage}
        />
      )}

      {showStorySections && readyForStory && flyer.cloudfront_url && (
        <StoryPreview flyerUrl={flyer.cloudfront_url} />
      )}

      {showPostingForm && (
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
          categoryLabel={
            postType === "story_and_feed"
              ? "Story + Feed"
              : postType === "story"
              ? "Story"
              : "Feed"
          }
          scheduleSelectionTitle={flyer.title}
          hideCaptionHashtags={postType === "story"}
          submitNowLabel={
            postType === "story_and_feed"
              ? "Post Story + Feed Now"
              : postType === "story"
              ? "Post Story Now"
              : undefined
          }
          submitScheduleLabel={
            postType === "story_and_feed"
              ? "Schedule Story + Feed"
              : postType === "story"
              ? "Schedule Story"
              : undefined
          }
        />
      )}

      {showFeedSections && carouselPost && (
        <PostStatusPanel
          title="Feed Post Status"
          postStatus={carouselPost.post_status}
          scheduledAt={carouselPost.scheduled_at}
          postedAt={carouselPost.posted_at}
          externalId={carouselPost.instagram_post_id}
          externalIdLabel="Instagram Post ID"
          postError={carouselPost.post_error}
          onCancel={handleCancelCarousel}
          onReschedule={handleRescheduleFailedCarousel}
          isCanceling={isCancelingCarousel}
          isRescheduling={isReschedulingCarousel}
        />
      )}

      {showStorySections && storyPost && (
        <PostStatusPanel
          title="Story Post Status"
          postStatus={storyPost.post_status}
          scheduledAt={storyPost.scheduled_at}
          postedAt={storyPost.posted_at}
          externalId={storyPost.instagram_story_id}
          externalIdLabel="Instagram Story ID"
          postError={storyPost.post_error}
          onCancel={handleCancelStory}
          onReschedule={handleRescheduleFailedStory}
          isCanceling={isCancelingStory}
          isRescheduling={isReschedulingStory}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "8px",
          paddingTop: "24px",
          borderTop: `1px solid ${tokens.border}`,
        }}
      >
        <Button onClick={onClose} variant="secondary" disabled={isBusy}>
          {allPosted ? "Close" : "Cancel"}
        </Button>
      </div>
    </div>
  );
}

type PostStatusPanelProps = {
  title: string;
  postStatus: string;
  scheduledAt: string | null;
  postedAt: string | null;
  externalId: string | null;
  externalIdLabel: string;
  postError: string | null;
  onCancel: () => void;
  onReschedule: () => void;
  isCanceling: boolean;
  isRescheduling: boolean;
};

function PostStatusPanel({
  title,
  postStatus,
  scheduledAt,
  postedAt,
  externalId,
  externalIdLabel,
  postError,
  onCancel,
  onReschedule,
  isCanceling,
  isRescheduling,
}: PostStatusPanelProps) {
  return (
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
          {title}
        </h3>
        {postStatus === "failed" && (
          <button
            onClick={onReschedule}
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
            {isRescheduling ? "Rescheduling..." : "Reschedule"}
          </button>
        )}
        {postStatus === "scheduled" && (
          <button
            onClick={onCancel}
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <StatusRow label="Status" value={postStatus} highlight={postStatus} />
        {scheduledAt && (
          <StatusRow
            label="Scheduled"
            value={new Date(scheduledAt).toLocaleString()}
          />
        )}
        {postedAt && (
          <StatusRow label="Posted" value={new Date(postedAt).toLocaleString()} />
        )}
        {externalId && (
          <StatusRow label={externalIdLabel} value={externalId} mono />
        )}
        {postError && (
          <div
            style={{
              padding: "12px",
              backgroundColor: tokens.danger + "20",
              borderRadius: "8px",
              fontSize: "14px",
              color: tokens.danger,
            }}
          >
            Error: {postError}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: string;
  mono?: boolean;
}) {
  const color =
    highlight === "posted"
      ? tokens.success
      : highlight === "failed"
      ? tokens.danger
      : tokens.textPrimary;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
      }}
    >
      <span style={{ color: tokens.textSecondary }}>{label}:</span>
      <span
        style={{
          color,
          fontWeight: highlight ? 500 : 400,
          textTransform: highlight ? "capitalize" : undefined,
          fontFamily: mono ? "monospace" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
