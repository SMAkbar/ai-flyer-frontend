"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import { ImageIcon, CheckIcon } from "@/components/icons";
import type { FlyerGeneratedImage } from "@/lib/api/flyers";

type ImageSelectionCardProps = {
  image: FlyerGeneratedImage;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  isPosted?: boolean; // Whether this image has been posted
};

export function ImageSelectionCard({
  image,
  isSelected,
  onSelect,
  disabled = false,
  isPosted = false,
}: ImageSelectionCardProps) {
  const [imageError, setImageError] = useState(false);

  // Determine border color: posted (green) > selected (accent) > default
  const borderColor = isPosted 
    ? "#10b981" // green-500
    : isSelected 
    ? tokens.accent 
    : tokens.border;

  return (
    <Card
      onClick={disabled ? undefined : onSelect}
      style={{
        backgroundColor: tokens.bgElevated,
        border: `2px solid ${borderColor}`,
        borderRadius: "12px",
        padding: 0,
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      {/* Image Preview */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1/1",
          overflow: "hidden",
          backgroundColor: tokens.bgHover,
        }}
      >
        {!imageError ? (
          <img
            src={image.cloudfront_url}
            alt={`Generated ${image.image_type} image`}
            onError={() => setImageError(true)}
            loading="lazy"
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
            }}
          >
            <ImageIcon size={32} color={tokens.textMuted} strokeWidth="1.5" />
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && !isPosted && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: tokens.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${tokens.bgBase}`,
            }}
          >
            <CheckIcon size={14} color={tokens.textPrimary} strokeWidth="3" />
          </div>
        )}

        {/* Posted Indicator */}
        {isPosted && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#10b981", // green-500
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${tokens.bgBase}`,
            }}
          >
            <CheckIcon size={14} color={tokens.textPrimary} strokeWidth="3" />
          </div>
        )}
      </div>
    </Card>
  );
}

