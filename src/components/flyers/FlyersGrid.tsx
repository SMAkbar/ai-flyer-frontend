'use client';
import React from 'react';
import { FlyerCard } from './FlyerCard';
import type { FlyerRead } from '@/lib/api/flyers';
import type { FilterStatus, SortOption } from '@/lib/utils/flyerFilters';

export type FlyersGridProps = {
  flyers: FlyerRead[];
  onDelete?: () => void;
  filterStatus?: FilterStatus;
  searchQuery?: string;
  sortOption?: SortOption;
};

export function FlyersGrid({ flyers, onDelete, filterStatus = "all", searchQuery = "", sortOption = "latest" }: FlyersGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: '24px',
      }}
    >
      {flyers.map((flyer) => (
        <FlyerCard 
          key={flyer.id} 
          flyer={flyer} 
          onDelete={onDelete}
          filterStatus={filterStatus}
          searchQuery={searchQuery}
          sortOption={sortOption}
        />
      ))}
    </div>
  );
}

