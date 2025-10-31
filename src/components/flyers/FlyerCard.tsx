"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import type { FlyerRead } from "@/lib/api/flyers";

type FlyerCardProps = {
  flyer: FlyerRead;
};

export function FlyerCard({ flyer }: FlyerCardProps) {
  const router = useRouter();

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
    <Card hoverElevate onClick={handleClick} style={{ cursor: "pointer" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        <img
          src={flyer.cloudfront_url}
          alt={flyer.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 600, color: tokens.textPrimary }}>
          {flyer.title}
        </h3>
        {flyer.description && (
          <p
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 14,
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
        <div style={{ fontSize: 12, color: tokens.textMuted }}>
          {formatDate(flyer.created_at)}
        </div>
      </div>
    </Card>
  );
}

