'use client';
import React from 'react';
import { FlyerCard } from './FlyerCard';
import type { FlyerRead } from '@/lib/api/flyers';
import { DEFAULT_SORT_OPTION, type FilterStatus, type SortOption } from '@/lib/utils/flyerFilters';

export type FlyersGridProps = {
  flyers: FlyerRead[];
  onDelete?: () => void;
  onUnarchive?: () => void;
  filterStatus?: FilterStatus;
  searchQuery?: string;
  sortOption?: SortOption;
  disableNavigation?: boolean;
  hideDelete?: boolean;
  showUnarchive?: boolean;
};

export function FlyersGrid({
  flyers,
  onDelete,
  onUnarchive,
  filterStatus = "all",
  searchQuery = "",
  sortOption = DEFAULT_SORT_OPTION,
  disableNavigation = false,
  hideDelete = false,
  showUnarchive = false,
}: FlyersGridProps) {
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
          onUnarchive={onUnarchive}
          filterStatus={filterStatus}
          searchQuery={searchQuery}
          sortOption={sortOption}
          disableNavigation={disableNavigation}
          hideDelete={hideDelete}
          showUnarchive={showUnarchive}
        />
      ))}
    </div>
  );
}

