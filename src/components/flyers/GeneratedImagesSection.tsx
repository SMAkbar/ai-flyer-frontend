"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GeneratedImageCard } from "@/components/flyers/GeneratedImageCard";
import { tokens } from "@/components/theme/tokens";
import { ImageIcon } from "@/components/icons";
import type { FlyerGeneratedImage } from "@/lib/api/flyers";

type GeneratedImagesSectionProps = {
  images: FlyerGeneratedImage[] | null | undefined;
  isLoading?: boolean;
  isGenerating?: boolean;
};

export function GeneratedImagesSection({
  images,
  isLoading = false,
  isGenerating = false,
}: GeneratedImagesSectionProps) {
  // Loading state - only show when actively generating (not just when no images exist)
  if (isLoading && isGenerating) {
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
            fontSize: "20px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          Generated Promotional Images
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            gap: "20px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1/1",
                backgroundColor: tokens.bgHover,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: `3px solid ${tokens.border}`,
                  borderTopColor: tokens.accent,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              >
                <style jsx>{`
                  @keyframes spin {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Empty state
  if (!images || images.length === 0) {
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
            fontSize: "20px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          Generated Promotional Images
        </h2>
        <div
          style={{
            textAlign: "center",
            padding: "40px 24px",
            backgroundColor: tokens.bgHover,
            borderRadius: "12px",
            border: `1px solid ${tokens.border}`,
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 16px",
              borderRadius: "12px",
              backgroundColor: tokens.bgElevated,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${tokens.border}`,
            }}
          >
            <ImageIcon size={32} color={tokens.textMuted} strokeWidth="1.5" />
          </div>
          <p
            style={{
              margin: 0,
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
              color: tokens.textPrimary,
            }}
          >
            No promotional images generated yet
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: tokens.textSecondary,
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Promotional images haven't been generated yet. Use the button above to generate them manually.
          </p>
        </div>
      </Card>
    );
  }

  // Sort images by creation date (newest first)
  const sortedImages = [...images].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Newest first
  });

  // Images available
  return (
    <Card
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
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: tokens.textPrimary,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Generated Promotional Images
        </h2>
        <div
          style={{
            fontSize: "14px",
            color: tokens.textSecondary,
            fontWeight: 500,
            padding: "4px 12px",
            backgroundColor: tokens.bgHover,
            borderRadius: "6px",
          }}
        >
          {sortedImages.length} {sortedImages.length === 1 ? "image" : "images"}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: "20px",
        }}
      >
        {sortedImages.map((image) => (
          <GeneratedImageCard key={image.id} image={image} />
        ))}
      </div>
    </Card>
  );
}

