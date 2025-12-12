"use client";

import React from "react";
import { tokens } from "@/components/theme/tokens";
import type { PostStatus } from "@/lib/api/instagram";

type PostStatusBadgeProps = {
  status: PostStatus;
};

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: tokens.textMuted,
          bgColor: tokens.bgHover,
        };
      case "scheduled":
        return {
          label: "Scheduled",
          color: tokens.accent,
          bgColor: `${tokens.accent}20`,
        };
      case "posting":
        return {
          label: "Processing...",
          color: "#f59e0b",
          bgColor: "#f59e0b20",
        };
      case "posted":
        return {
          label: "Posted",
          color: "#10b981",
          bgColor: "#10b98120",
        };
      case "failed":
        return {
          label: "Failed",
          color: tokens.danger,
          bgColor: `${tokens.danger}20`,
        };
      default:
        return {
          label: status,
          color: tokens.textMuted,
          bgColor: tokens.bgHover,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "12px",
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bgColor,
        padding: "4px 10px",
        borderRadius: "6px",
        letterSpacing: "0.01em",
      }}
    >
      {config.label}
    </span>
  );
}

