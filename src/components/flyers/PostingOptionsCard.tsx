"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { tokens } from "@/components/theme/tokens";

type PostingMode = "now" | "schedule";

type PostingOptionsCardProps = {
  caption: string;
  hashtags: string;
  scheduledAt: string; // ISO datetime string
  postingMode: PostingMode; // Controlled from parent
  onCaptionChange: (caption: string) => void;
  onHashtagsChange: (hashtags: string) => void;
  onScheduledAtChange: (scheduledAt: string) => void;
  onPostingModeChange: (mode: PostingMode) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  categoryLabel?: string; // Optional label to show which category this is for
};

export function PostingOptionsCard({
  caption,
  hashtags,
  scheduledAt,
  postingMode,
  onCaptionChange,
  onHashtagsChange,
  onScheduledAtChange,
  onPostingModeChange,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  categoryLabel,
}: PostingOptionsCardProps) {
  const handleModeChange = (mode: PostingMode) => {
    onPostingModeChange(mode);
  };

  // Generate unique name for radio buttons based on category
  const radioGroupName = `postingMode-${categoryLabel || "default"}`;

  const captionLength = caption.length;
  const maxCaptionLength = 2200;

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
        {categoryLabel ? `${categoryLabel} - Posting Options` : "Posting Options"}
      </h2>

      {/* Caption */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          Caption
        </label>
        <Textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Enter post caption (auto-generated from event data)"
          disabled={disabled || isSubmitting}
          rows={4}
          style={{
            marginBottom: "4px",
          }}
        />
        <div
          style={{
            fontSize: "12px",
            color:
              captionLength > maxCaptionLength
                ? tokens.danger
                : tokens.textMuted,
            textAlign: "right",
          }}
        >
          {captionLength} / {maxCaptionLength} characters
        </div>
      </div>

      {/* Hashtags */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          Hashtags (optional)
        </label>
        <Input
          type="text"
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="#hashtag1 #hashtag2 #hashtag3"
          disabled={disabled || isSubmitting}
        />
      </div>

      {/* Posting Mode */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "12px",
          }}
        >
          When to Post
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              opacity: disabled || isSubmitting ? 0.6 : 1,
            }}
          >
            <input
              type="radio"
              name={radioGroupName}
              value="now"
              checked={postingMode === "now"}
              onChange={() => handleModeChange("now")}
              disabled={disabled || isSubmitting}
              style={{
                width: "18px",
                height: "18px",
                cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                color: tokens.textPrimary,
                fontWeight: 500,
              }}
            >
              Post Now
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              opacity: disabled || isSubmitting ? 0.6 : 1,
            }}
          >
            <input
              type="radio"
              name={radioGroupName}
              value="schedule"
              checked={postingMode === "schedule"}
              onChange={() => handleModeChange("schedule")}
              disabled={disabled || isSubmitting}
              style={{
                width: "18px",
                height: "18px",
                cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                color: tokens.textPrimary,
                fontWeight: 500,
              }}
            >
              Schedule for Later
            </span>
          </label>
        </div>

        {/* Date/Time Picker */}
        {postingMode === "schedule" && (
          <div style={{ marginTop: "16px", marginLeft: "28px" }}>
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
            <DateTimePicker
              value={scheduledAt}
              onChange={onScheduledAtChange}
              disabled={disabled || isSubmitting}
              min={new Date().toISOString()} // Prevent past dates
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={disabled || isSubmitting || captionLength > maxCaptionLength}
        style={{
          width: "100%",
        }}
      >
        {isSubmitting
          ? "Scheduling..."
          : postingMode === "now"
          ? `Post ${categoryLabel ? categoryLabel : ""} Now`.trim()
          : `Schedule ${categoryLabel ? categoryLabel : ""} Post`.trim()}
      </Button>
    </Card>
  );
}

