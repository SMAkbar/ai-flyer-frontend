"use client";

import React from "react";
import { tokens } from "@/components/theme/tokens";

type StoryPreviewProps = {
  flyerUrl: string;
  title?: string;
};

/**
 * 9:16 story layout preview — blurred background + centered flyer (no border).
 * Matches backend story_image_processing proportions.
 */
export function StoryPreview({ flyerUrl, title = "Story preview" }: StoryPreviewProps) {
  return (
    <div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          width: "100%",
          maxWidth: "280px",
          aspectRatio: "9 / 16",
          margin: "0 auto",
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${tokens.border}`,
          backgroundColor: "#000",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            backgroundImage: `url(${flyerUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(24px) brightness(0.85)",
            transform: "scale(1.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12% 8%",
          }}
        >
          <img
            src={flyerUrl}
            alt="Story flyer preview"
            style={{
              width: "78%",
              maxHeight: "76%",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
}
