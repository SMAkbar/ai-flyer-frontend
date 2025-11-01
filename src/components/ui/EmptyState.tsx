'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';
import { ImageIcon } from '@/components/icons';

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
}: EmptyStateProps) {
  const defaultIcon = icon ?? (
    <ImageIcon 
      size={40} 
      color={tokens.textMuted}
      strokeWidth={2}
    />
  );

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 24px',
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: '20px',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '20px',
          backgroundColor: tokens.bgHover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${tokens.border}`,
        }}
      >
        {defaultIcon}
      </div>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: '8px',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: tokens.textSecondary,
          fontSize: '15px',
          marginBottom: '24px',
          maxWidth: '400px',
          margin: '0 auto 24px',
        }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

