"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import type { FlyerRead } from "@/lib/api/flyers";

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
          aspectRatio: "16/9",
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
              objectFit: "cover",
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
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.textMuted}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          {formatDate(flyer.created_at)}
        </div>
      </div>
    </Card>
  );
}

