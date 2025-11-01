'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { tokens } from '@/components/theme/tokens';

export type FlyerImageCardProps = {
  imageUrl: string;
  alt: string;
  width?: string;
};

export function FlyerImageCard({ 
  imageUrl, 
  alt, 
  width = '350px',
}: FlyerImageCardProps) {
  return (
    <div style={{ width, margin: 0, padding: 0 }}>
      <Card
        style={{
          padding: 0,
          margin: 0,
          backgroundColor: tokens.bgElevated,
          border: `1px solid ${tokens.border}`,
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/5',
            overflow: 'hidden',
            backgroundColor: tokens.bgHover,
          }}
        >
          <img
            src={imageUrl}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </Card>
    </div>
  );
}

