"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import { ImageSelectionCard } from "./ImageSelectionCard";
import type { FlyerGeneratedImage, GeneratedImageType } from "@/lib/api/flyers";

type ImageCategorySectionProps = {
  categoryType: GeneratedImageType;
  categoryLabel: string;
  images: FlyerGeneratedImage[];
  selectedImageId: number | null;
  onSelectImage: (imageId: number) => void;
  disabled?: boolean;
};

export function ImageCategorySection({
  categoryType,
  categoryLabel,
  images,
  selectedImageId,
  onSelectImage,
  disabled = false,
}: ImageCategorySectionProps) {
  // Filter and sort images by creation date (newest first)
  const categoryImages = images
    .filter((img) => img.image_type === categoryType)
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Newest first
    });

  if (categoryImages.length === 0) {
    return null; // Don't render section if no images
  }

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
          marginBottom: "8px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: tokens.textPrimary,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {categoryLabel}
        </h2>
        <div
          style={{
            fontSize: "12px",
            color: tokens.textSecondary,
            fontWeight: 500,
            padding: "2px 8px",
            backgroundColor: tokens.bgHover,
            borderRadius: "4px",
          }}
        >
          {categoryImages.length} {categoryImages.length === 1 ? "option" : "options"}
        </div>
      </div>
      <p
        style={{
          fontSize: "14px",
          color: tokens.textSecondary,
          marginBottom: "20px",
        }}
      >
        Select one image from this category to post on Instagram
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
          gap: "16px",
        }}
      >
        {categoryImages.map((image) => (
          <ImageSelectionCard
            key={image.id}
            image={image}
            isSelected={selectedImageId === image.id}
            onSelect={() => !disabled && onSelectImage(image.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </Card>
  );
}

