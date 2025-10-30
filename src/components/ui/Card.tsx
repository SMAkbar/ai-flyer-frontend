'use client';
import React from 'react';
import { styles } from '../theme/tokens';

export function Card({ children, hoverElevate }: { children: React.ReactNode; hoverElevate?: boolean }) {
  const base = styles.card as React.CSSProperties;
  const transition = hoverElevate ? { transition: 'transform 120ms ease, box-shadow 120ms ease' } : {};
  return (
    <div
      style={{ ...base, ...transition }}
      onMouseEnter={(e) => {
        if (!hoverElevate) return;
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!hoverElevate) return;
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {children}
    </div>
  );
}
