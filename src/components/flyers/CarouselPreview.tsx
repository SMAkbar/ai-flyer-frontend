"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import type { FlyerGeneratedImage } from "@/lib/api/flyers";

type CarouselPreviewProps = {
  combinedImage: FlyerGeneratedImage | null;
  /** Synthetic row for original flyer (e.g. id 0) */
  originalFlyerImage: FlyerGeneratedImage | null;
};

export function CarouselPreview({
  combinedImage,
  originalFlyerImage,
}: CarouselPreviewProps) {
  const images = [
    { image: combinedImage, label: "1. Combined", isOriginalFlyer: false },
    { image: originalFlyerImage, label: "2. Original Flyer", isOriginalFlyer: true },
  ];

  const allSelected = images.every((item) => item.image !== null);

  if (!allSelected) {
    return null;
  }

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
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
            Carousel Preview
          </h3>
          <span
            style={{
              fontSize: "12px",
              color: tokens.textSecondary,
              backgroundColor: tokens.bgHover,
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Swipeable
          </span>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: tokens.textSecondary,
            margin: 0,
            marginBottom: "8px",
          }}
        >
          These two images will be posted as one carousel on Instagram, in this order.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {images.map((item, index) => {
            if (!item.image) return null;
            return (
              <div
                key={`${item.label}-${item.image.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minWidth: "200px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "200px",
                    height: "200px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: `2px solid ${tokens.border}`,
                    backgroundColor: item.isOriginalFlyer ? "#000" : tokens.bgHover,
                  }}
                >
                  {item.image.cloudfront_url ? (
                    <img
                      src={item.image.cloudfront_url}
                      alt={item.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: item.isOriginalFlyer ? "contain" : "cover",
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
                        color: tokens.textSecondary,
                        fontSize: "14px",
                      }}
                    >
                      No image
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: tokens.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
