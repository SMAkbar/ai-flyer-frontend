'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';
import { LoaderIcon } from '@/components/icons';

export type LoadingSpinnerProps = {
  message?: string;
  size?: number;
  fullHeight?: boolean;
};

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 20,
  fullHeight = false,
}: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: tokens.textSecondary,
        fontSize: '16px',
        ...(fullHeight ? { minHeight: '400px' } : {}),
      }}
    >
      <LoaderIcon size={size} color={tokens.textSecondary} />
      {message}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

