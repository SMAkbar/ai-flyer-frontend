'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';
import { WarningIcon } from '@/components/icons';

export type AlertProps = {
  variant?: 'error' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
};

export function Alert({ 
  variant = 'error', 
  children, 
  style,
  icon,
}: AlertProps) {
  const variantStyles = {
    error: {
      backgroundColor: `${tokens.danger}15`,
      border: `1px solid ${tokens.danger}40`,
      color: tokens.danger,
    },
    warning: {
      backgroundColor: `${tokens.warning}15`,
      border: `1px solid ${tokens.warning}40`,
      color: tokens.warning,
    },
    success: {
      backgroundColor: `${tokens.success}15`,
      border: `1px solid ${tokens.success}40`,
      color: tokens.success,
    },
    info: {
      backgroundColor: `${tokens.textSecondary}15`,
      border: `1px solid ${tokens.textSecondary}40`,
      color: tokens.textSecondary,
    },
  };

  const defaultIcon = icon ?? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {defaultIcon}
      {children}
    </div>
  );
}

