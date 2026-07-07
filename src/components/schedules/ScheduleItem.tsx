"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";
import { instagramApi, type ScheduledPostWithFlyerRead } from "@/lib/api/instagram";

type ScheduleItemProps = {
  post: ScheduledPostWithFlyerRead;
  onCancel: () => void;
};

const postTypeColors: Record<string, string> = {
  feed: "#6B7280",
  story: "#7C3AED",
  story_and_feed: "#059669",
};

function getPostTypeLabel(post: ScheduledPostWithFlyerRead): string {
  if (post.image_type === "Feed" || post.image_type === "Story" || post.image_type === "Story + Feed") {
    return post.image_type;
  }
  switch (post.post_type) {
    case "story":
      return "Story";
    case "story_and_feed":
      return "Story + Feed";
    case "feed":
    default:
      return "Feed";
  }
}

export function ScheduleItem({ post, onCancel }: ScheduleItemProps) {
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);

  const statusColors: Record<string, string> = {
    scheduled: tokens.success,
    posting: tokens.warning,
    posted: tokens.success,
    failed: tokens.danger,
    pending: tokens.textSecondary,
  };

  const statusLabels: Record<string, string> = {
    scheduled: "Scheduled",
    posting: "Posting...",
    posted: "Posted",
    failed: "Failed",
    pending: "Pending",
  };

  const postType = post.post_type ?? "feed";
  const postTypeLabel = getPostTypeLabel(post);

  async function handleCancel() {
    if (
      !confirm(
        "Are you sure you want to cancel this scheduled post? This action cannot be undone."
      )
    ) {
      return;
    }

    if (!post.flyer_id) {
      alert("Cannot cancel post: flyer ID is missing");
      return;
    }

    setIsCanceling(true);
    try {
      if (postType === "story_and_feed") {
        const [carouselResult, storyResult] = await Promise.all([
          instagramApi.cancelCarousel(post.flyer_id),
          instagramApi.cancelStory(post.flyer_id),
        ]);

        if (!carouselResult.ok || !storyResult.ok) {
          const message = !carouselResult.ok
            ? carouselResult.error.message
            : !storyResult.ok
              ? storyResult.error.message
              : "Failed to cancel scheduled posts";
          alert(message);
          return;
        }
      } else if (postType === "story") {
        const result = await instagramApi.cancelStory(post.flyer_id);
        if (!result.ok) {
          alert(result.error.message || "Failed to cancel scheduled story");
          return;
        }
      } else {
        const result = await instagramApi.cancelCarousel(post.flyer_id);
        if (!result.ok) {
          alert(result.error.message || "Failed to cancel scheduled feed post");
          return;
        }
      }

      onCancel();
    } catch {
      alert("An unexpected error occurred");
    } finally {
      setIsCanceling(false);
    }
  }

  function handleViewFlyer() {
    if (!post.flyer_id) {
      alert("Cannot view flyer: flyer ID is missing");
      return;
    }
    router.push(`/flyers/${post.flyer_id}`);
  }

  const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;
  const postedDate = post.posted_at ? new Date(post.posted_at) : null;

  const canCancel =
    post.post_status === "scheduled" || post.post_status === "pending";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        border: `1px solid ${tokens.border}`,
        borderRadius: "8px",
        backgroundColor: tokens.bgElevated,
        transition: "all 0.2s ease",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = tokens.accent;
        e.currentTarget.style.boxShadow = `0 2px 8px ${tokens.accent}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = tokens.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: postType === "story" || postType === "story_and_feed" ? "9 / 16" : "1",
          maxHeight: postType === "story" || postType === "story_and_feed" ? "280px" : undefined,
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: tokens.bgHover,
          margin: "0 auto",
        }}
      >
        {post.cloudfront_url ? (
          <img
            src={post.cloudfront_url}
            alt={postTypeLabel}
            style={{
              width: "100%",
              height: "100%",
              objectFit: postType === "feed" ? "cover" : "contain",
              backgroundColor: "#000",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.textMuted,
              fontSize: "12px",
            }}
          >
            No image
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: tokens.textPrimary,
                margin: 0,
                marginBottom: "4px",
              }}
            >
              {post.flyer_title}
            </h3>
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "999px",
                backgroundColor: `${postTypeColors[postType] ?? tokens.textSecondary}22`,
                color: postTypeColors[postType] ?? tokens.textSecondary,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {postTypeLabel}
            </span>
          </div>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: `${statusColors[post.post_status]}20`,
              color: statusColors[post.post_status],
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {statusLabels[post.post_status] || post.post_status}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {scheduledDate && (
            <div
              style={{
                fontSize: "14px",
                color: tokens.textPrimary,
                fontWeight: 500,
              }}
            >
              Scheduled:{" "}
              {scheduledDate.toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          {postedDate && (
            <div style={{ fontSize: "14px", color: tokens.textSecondary }}>
              Posted: {postedDate.toLocaleString()}
            </div>
          )}
          {post.post_error && (
            <div
              title={post.post_error}
              style={{
                fontSize: "14px",
                color: tokens.danger,
                marginTop: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              Error: {post.post_error}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "auto",
            paddingTop: "8px",
          }}
        >
          <Button
            variant="secondary"
            onClick={handleViewFlyer}
            disabled={!post.flyer_id}
          >
            View Flyer
          </Button>
          {canCancel && (
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              {isCanceling ? "Canceling..." : "Cancel"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
