'use client';
import React from 'react';

export type IconProps = { path: string; size?: number; color?: string };

export function Icon({ path, size = 20, color = '#B3B3B3' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={path} fill={color} />
    </svg>
  );
}
