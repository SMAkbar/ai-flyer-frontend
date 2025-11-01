'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';

export type StatusBadgeProps = {
  status: 'completed' | 'processing' | 'failed' | 'pending';
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    completed: {
      backgroundColor: `${tokens.success}15`,
      color: tokens.success,
      border: `${tokens.success}40`,
      label: 'Completed',
    },
    processing: {
      backgroundColor: `${tokens.accent}15`,
      color: tokens.accent,
      border: `${tokens.accent}40`,
      label: 'Processing',
    },
    failed: {
      backgroundColor: `${tokens.danger}15`,
      color: tokens.danger,
      border: `${tokens.danger}40`,
      label: 'Failed',
    },
    pending: {
      backgroundColor: `${tokens.textMuted}15`,
      color: tokens.textMuted,
      border: `${tokens.border}40`,
      label: 'Pending',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: config.backgroundColor,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {label ?? config.label}
    </span>
  );
}

