"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PostStatusBadge } from "@/components/flyers/PostStatusBadge";
import { tokens } from "@/components/theme/tokens";
import { ImageIcon, ExternalLinkIcon, ClockIcon } from "@/components/icons";
import type { FlyerRead, ExtractionStatus } from "@/lib/api/flyers";
import type { PostStatus } from "@/lib/api/instagram";

type FlyerCardProps = {
  flyer: FlyerRead;
};

export function FlyerCard({ flyer }: FlyerCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClick = () => {
    router.push(`/flyers/${flyer.id}`);
  };

  return (
    <Card
      hoverElevate
      onClick={handleClick}
      style={{
        cursor: "pointer",
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: 0,
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3/4",
          overflow: "hidden",
          backgroundColor: tokens.bgHover,
        }}
      >
        {!imageError ? (
          <img
            src={flyer.cloudfront_url}
            alt={flyer.title}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
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
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: `${tokens.bgBase}e6`,
            backdropFilter: "blur(8px)",
            borderRadius: "8px",
            padding: "6px 10px",
            border: `1px solid ${tokens.border}`,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: tokens.textPrimary,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ExternalLinkIcon size={14} color="currentColor" />
            View Details
          </span>
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        <h3
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "18px",
            fontWeight: 600,
            color: tokens.textPrimary,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {flyer.title}
        </h3>
        {flyer.description && (
          <p
            style={{
              margin: 0,
              marginBottom: "12px",
              fontSize: "14px",
              color: tokens.textSecondary,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {flyer.description}
          </p>
        )}
        {/* Status Badges */}
        {(flyer.extraction_status || flyer.carousel_post_status) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {flyer.extraction_status && (
              <StatusBadge
                status={flyer.extraction_status as "pending" | "processing" | "completed" | "failed"}
                label={
                  flyer.extraction_status === "processing"
                    ? "Extracting..."
                    : flyer.extraction_status === "completed"
                    ? "Extracted"
                    : flyer.extraction_status === "failed"
                    ? "Extraction Failed"
                    : "Pending Extraction"
                }
              />
            )}
            {flyer.carousel_post_status && (
              <PostStatusBadge status={flyer.carousel_post_status as PostStatus} />
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: tokens.textMuted,
            paddingTop: "12px",
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <ClockIcon size={14} color="currentColor" />
          {formatDate(flyer.created_at)}
        </div>
      </div>
    </Card>
  );
}

