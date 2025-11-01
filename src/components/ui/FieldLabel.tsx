'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';

export type FieldLabelProps = {
  children: React.ReactNode;
};

export function FieldLabel({ children }: FieldLabelProps) {
  return (
    <div
      style={{
        fontSize: '12px',
        fontWeight: 500,
        color: tokens.textMuted,
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </div>
  );
}

