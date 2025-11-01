"use client";

import { useState } from "react";
import { tokens } from "@/components/theme/tokens";

type AvatarPreviewProps = {
  avatarUrl: string | null;
  name?: string | null;
  size?: number;
};

export function AvatarPreview({ avatarUrl, name, size = 80 }: AvatarPreviewProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  if (avatarUrl && !imageError) {
    return (
      <div style={{ position: "relative" }}>
        <img
          src={avatarUrl}
          alt={name || "Avatar"}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: `2px solid ${tokens.border}`,
            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
          }}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: tokens.bgHover,
        border: `2px solid ${tokens.border}`,
        color: tokens.textPrimary,
        fontSize: size * 0.4,
        fontWeight: 600,
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
      }}
    >
      {initials}
    </div>
  );
}

