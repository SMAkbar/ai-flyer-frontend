'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';
import { ClockIcon } from '@/components/icons';

export type FlyerHeaderProps = {
  title: string;
  description?: string | null;
  createdAt: string;
};

export function FlyerHeader({ title, description, createdAt }: FlyerHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h1
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: tokens.textPrimary,
          marginBottom: '12px',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            fontSize: '16px',
            color: tokens.textSecondary,
            lineHeight: 1.6,
            marginBottom: '16px',
          }}
        >
          {description}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: tokens.textMuted,
        }}
      >
        <ClockIcon size={16} color="currentColor" />
        Created {formatDate(createdAt)}
      </div>
    </div>
  );
}

