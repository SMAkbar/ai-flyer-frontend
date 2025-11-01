"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import { ImageIcon, DownloadIcon, ClockIcon } from "@/components/icons";
import type { FlyerGeneratedImage } from "@/lib/api/flyers";

type GeneratedImageCardProps = {
  image: FlyerGeneratedImage;
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

export function GeneratedImageCard({ image }: GeneratedImageCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = image.cloudfront_url;
    link.download = `${image.image_type}_${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
            alt={`Generated ${getImageTypeLabel(image.image_type)} image`}
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
            <ImageIcon size={48} color={tokens.textMuted} strokeWidth="1.5" />
          </div>
        )}
        
        {/* Download Button Overlay */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            opacity: imageError ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <button
            onClick={handleDownload}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${tokens.bgBase}e6`;
            }}
            style={{
              backgroundColor: `${tokens.bgBase}e6`,
              backdropFilter: "blur(8px)",
              borderRadius: "8px",
              padding: "8px",
              border: `1px solid ${tokens.border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
            }}
            aria-label={`Download ${getImageTypeLabel(image.image_type)} image`}
          >
            <DownloadIcon size={18} color={tokens.textPrimary} />
          </button>
        </div>
      </div>

      {/* Image Info */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: tokens.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            {getImageTypeLabel(image.image_type)}
          </h3>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: tokens.textMuted,
          }}
        >
          <ClockIcon size={14} color="currentColor" />
          {formatDate(image.created_at)}
        </div>
      </div>
    </Card>
  );
}

