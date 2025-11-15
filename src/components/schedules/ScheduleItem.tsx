"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";
import { instagramApi, type ScheduledPostWithFlyerRead } from "@/lib/api/instagram";
import { ExternalLinkIcon } from "@/components/icons";

type ScheduleItemProps = {
  post: ScheduledPostWithFlyerRead;
  onCancel: () => void;
};

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

  const imageTypeLabels: Record<string, string> = {
    time_date: "Time/Date",
    performers: "Performers",
    location: "Location",
  };

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
      const result = await instagramApi.cancelScheduledPost(
        post.flyer_id,
        post.id
      );

      if (result.ok) {
        onCancel();
      } else {
        alert(result.error.message || "Failed to cancel scheduled post");
      }
    } catch (err) {
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

  function handleViewInstagram() {
    if (post.instagram_post_id) {
      window.open(
        `https://www.instagram.com/p/${post.instagram_post_id}/`,
        "_blank"
      );
    }
  }

  const scheduledDate = post.scheduled_at
    ? new Date(post.scheduled_at)
    : null;
  const postedDate = post.posted_at
    ? new Date(post.posted_at)
    : null;

  const canCancel =
    post.post_status === "scheduled" ||
    post.post_status === "pending";

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
      {/* Image Preview */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: tokens.bgHover,
        }}
      >
        {post.cloudfront_url ? (
          <img
            src={post.cloudfront_url}
            alt={imageTypeLabels[post.image_type] || post.image_type}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
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
              backgroundColor: tokens.bgHover,
              color: tokens.textMuted,
              fontSize: "12px",
            }}
          >
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minHeight: 0 }}>
        {/* Title and Status */}
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
            <p
              style={{
                fontSize: "14px",
                color: tokens.textSecondary,
                margin: 0,
              }}
            >
              {imageTypeLabels[post.image_type] || post.image_type}
            </p>
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

        {/* Schedule Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {scheduledDate && (
            <div
              style={{
                fontSize: "14px",
                color: tokens.textPrimary,
                fontWeight: 500,
              }}
            >
              📅 Scheduled: {scheduledDate.toLocaleString(undefined, {
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
              ✅ Posted: {postedDate.toLocaleString()}
            </div>
          )}
          {post.post_error && (
            <div
              style={{
                fontSize: "14px",
                color: tokens.danger,
                marginTop: "4px",
              }}
            >
              ⚠️ Error: {post.post_error}
            </div>
          )}
        </div>

        {/* Actions */}
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
          {post.post_status === "posted" && post.instagram_post_id && (
            <Button
              variant="secondary"
              onClick={handleViewInstagram}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View on Instagram
                <ExternalLinkIcon size={14} />
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

