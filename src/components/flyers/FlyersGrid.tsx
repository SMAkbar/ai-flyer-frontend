'use client';
import React from 'react';
import { FlyerCard } from './FlyerCard';
import type { FlyerRead } from '@/lib/api/flyers';

export type FlyersGridProps = {
  flyers: FlyerRead[];
};

export function FlyersGrid({ flyers }: FlyersGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: '24px',
      }}
    >
      {flyers.map((flyer) => (
        <FlyerCard key={flyer.id} flyer={flyer} />
      ))}
    </div>
  );
}

