"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { tokens } from "@/components/theme/tokens";
import { wordpressApi, type WordPressPostRead } from "@/lib/api/wordpress";

type WordPressPostingCardProps = {
  flyerId: number;
  flyerTitle: string;
  flyerImageUrl: string;
  existingPost: WordPressPostRead | null;
  onClose: () => void;
  onPostUpdated: (post: WordPressPostRead) => void;
};

export function WordPressPostingCard({
  flyerId,
  flyerTitle,
  flyerImageUrl,
  existingPost,
  onClose,
  onPostUpdated,
}: WordPressPostingCardProps) {
  const [postingMode, setPostingMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16) // Default to 1 hour from now
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPosted = existingPost?.post_status === "posted";
  const isScheduled = existingPost?.post_status === "scheduled";

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (postingMode === "now") {
        const result = await wordpressApi.postNow(flyerId);
        if (result.ok) {
          setSuccess("Successfully posted to WordPress!");
          onPostUpdated(result.data);
        } else {
          setError(result.error.message || "Failed to post to WordPress");
        }
      } else {
        const result = await wordpressApi.schedulePost(flyerId, {
          scheduled_at: new Date(scheduledAt).toISOString(),
        });
        if (result.ok) {
          setSuccess(`Scheduled for ${new Date(scheduledAt).toLocaleString()}`);
          onPostUpdated(result.data);
        } else {
          setError(result.error.message || "Failed to schedule WordPress post");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    setIsCanceling(true);
    setError(null);

    try {
      const result = await wordpressApi.cancelPost(flyerId);
      if (result.ok) {
        setSuccess("WordPress post canceled");
        onPostUpdated({} as WordPressPostRead); // Will reload
      } else {
        setError(result.error.message || "Failed to cancel WordPress post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsCanceling(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: tokens.textPrimary,
                margin: 0,
                marginBottom: "8px",
              }}
            >
              Post to WordPress
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: tokens.textSecondary,
                margin: 0,
              }}
            >
              {flyerTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: tokens.textSecondary,
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" style={{ marginBottom: "16px" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" style={{ marginBottom: "16px" }}>
            {success}
          </Alert>
        )}

        {/* Flyer Preview */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "200px",
              aspectRatio: "1",
              borderRadius: "12px",
              overflow: "hidden",
              border: `2px solid ${tokens.border}`,
            }}
          >
            <img
              src={flyerImageUrl}
              alt={flyerTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* Status Display (if already posted/scheduled) */}
        {existingPost && (
          <div
            style={{
              backgroundColor: tokens.bgHover,
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: tokens.textSecondary }}>Status:</span>
              <span
                style={{
                  color:
                    existingPost.post_status === "posted"
                      ? tokens.success
                      : existingPost.post_status === "failed"
                      ? tokens.danger
                      : existingPost.post_status === "posting"
                      ? tokens.warning
                      : tokens.textPrimary,
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {existingPost.post_status}
              </span>
            </div>
            {existingPost.scheduled_at && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: tokens.textSecondary }}>Scheduled:</span>
                <span style={{ color: tokens.textPrimary }}>
                  {new Date(existingPost.scheduled_at).toLocaleString()}
                </span>
              </div>
            )}
            {existingPost.posted_at && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: tokens.textSecondary }}>Posted:</span>
                <span style={{ color: tokens.textPrimary }}>
                  {new Date(existingPost.posted_at).toLocaleString()}
                </span>
              </div>
            )}
            {existingPost.wp_event_url && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: tokens.textSecondary }}>Event URL:</span>
                <a
                  href={existingPost.wp_event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: tokens.accent,
                    textDecoration: "none",
                  }}
                >
                  View Event →
                </a>
              </div>
            )}
            {existingPost.post_error && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: tokens.danger + "20",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: tokens.danger,
                }}
              >
                Error: {existingPost.post_error}
              </div>
            )}
          </div>
        )}

        {/* Posting Options (only show if not already posted) */}
        {!isPosted && (
          <>
            {/* Posting Mode Selection */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="postingMode"
                  value="now"
                  checked={postingMode === "now"}
                  onChange={() => setPostingMode("now")}
                  disabled={isSubmitting}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "15px", color: tokens.textPrimary, fontWeight: 500 }}>
                  Post Now
                </span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="postingMode"
                  value="schedule"
                  checked={postingMode === "schedule"}
                  onChange={() => setPostingMode("schedule")}
                  disabled={isSubmitting}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "15px", color: tokens.textPrimary, fontWeight: 500 }}>
                  Schedule for Later
                </span>
              </label>
            </div>

            {/* Date/Time Picker */}
            {postingMode === "schedule" && (
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: tokens.textPrimary,
                    marginBottom: "8px",
                  }}
                >
                  Scheduled Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  disabled={isSubmitting}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          {isScheduled && (
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isCanceling || isSubmitting}
              style={{
                backgroundColor: tokens.danger + "20",
                color: tokens.danger,
                borderColor: tokens.danger,
              }}
            >
              {isCanceling ? "Canceling..." : "Cancel Post"}
            </Button>
          )}
          <Button onClick={onClose} variant="secondary" disabled={isSubmitting || isCanceling}>
            {isPosted ? "Close" : "Cancel"}
          </Button>
          {!isPosted && (
            <Button onClick={handleSubmit} variant="primary" disabled={isSubmitting || isCanceling}>
              {isSubmitting
                ? "Processing..."
                : postingMode === "now"
                ? "Post Now"
                : "Schedule Post"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

