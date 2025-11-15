"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";
import { PostStatusBadge } from "./PostStatusBadge";
import type { ScheduledPostWithFlyerRead } from "@/lib/api/instagram";

type ScheduledPostsCardProps = {
  posts: ScheduledPostWithFlyerRead[];
  onCancelPost: (imageId: number) => void;
  isCanceling?: number | null;
};

export function ScheduledPostsCard({
  posts,
  onCancelPost,
  isCanceling = null,
}: ScheduledPostsCardProps) {
  if (posts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageTypeLabel = (type: string): string => {
    switch (type) {
      case "time_date":
        return "Time/Date";
      case "performers":
        return "Performers";
      case "location":
        return "Location";
      default:
        return type;
    }
  };

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Scheduled Posts
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              backgroundColor: tokens.bgHover,
              borderRadius: "12px",
              border: `1px solid ${tokens.border}`,
            }}
          >
            {/* Image Preview */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: tokens.bgElevated,
                flexShrink: 0,
              }}
            >
              {post.cloudfront_url ? (
                <img
                  src={post.cloudfront_url}
                  alt={getImageTypeLabel(post.image_type)}
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
                    backgroundColor: tokens.bgElevated,
                  }}
                >
                  <span style={{ color: tokens.textMuted, fontSize: "12px" }}>
                    No image
                  </span>
                </div>
              )}
            </div>

            {/* Post Info */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: tokens.textPrimary,
                  }}
                >
                  {getImageTypeLabel(post.image_type)}
                </h3>
                <PostStatusBadge status={post.post_status} />
              </div>

              {post.scheduled_at && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: tokens.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Scheduled: {formatDate(post.scheduled_at)}
                </p>
              )}

              {post.posted_at && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: tokens.textSecondary,
                  }}
                >
                  Posted: {formatDate(post.posted_at)}
                </p>
              )}

              {post.post_error && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: tokens.danger,
                    marginTop: "4px",
                  }}
                >
                  Error: {post.post_error}
                </p>
              )}
            </div>

            {/* Cancel Button */}
            {post.post_status === "scheduled" &&
              !post.posted_at && (
                <Button
                  variant="secondary"
                  onClick={() => onCancelPost(post.id)}
                  disabled={isCanceling === post.id}
                  style={{
                    flexShrink: 0,
                  }}
                >
                  {isCanceling === post.id ? "Canceling..." : "Cancel"}
                </Button>
              )}
          </div>
        ))}
      </div>
    </Card>
  );
}

