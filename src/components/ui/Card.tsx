'use client';
import React from 'react';
import { styles } from '../theme/tokens';

type CardProps = {
  children: React.ReactNode;
  hoverElevate?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export function Card({ children, hoverElevate, onClick, style, onMouseEnter, onMouseLeave }: CardProps) {
  const base = styles.card as React.CSSProperties;
  const transition = hoverElevate ? { transition: 'transform 120ms ease, box-shadow 120ms ease' } : {};
  return (
    <div
      style={{ ...base, ...transition, ...style }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverElevate) {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)';
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (hoverElevate) {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }
        onMouseLeave?.(e);
      }}
    >
      {children}
    </div>
  );
}
