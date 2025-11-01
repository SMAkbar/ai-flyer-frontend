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
  const categoryImages = images.filter((img) => img.image_type === categoryType);

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
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: "16px",
          letterSpacing: "-0.01em",
        }}
      >
        {categoryLabel}
      </h2>
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

