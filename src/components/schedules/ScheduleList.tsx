"use client";

import { ScheduleItem } from "./ScheduleItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { tokens } from "@/components/theme/tokens";
import type {
  ScheduledPostWithFlyerRead,
  ScheduledPostsSort,
  ScheduledPostsStatusFilter,
} from "@/lib/api/instagram";

type ScheduleListProps = {
  posts: ScheduledPostWithFlyerRead[];
  onRefresh: () => void;
  filterStatus: ScheduledPostsStatusFilter;
  sortOption: ScheduledPostsSort;
  onFilterStatusChange: (value: ScheduledPostsStatusFilter) => void;
  onSortOptionChange: (value: ScheduledPostsSort) => void;
  totalPosts: number;
  isLoading: boolean;
};

export function ScheduleList({
  posts,
  onRefresh,
  filterStatus,
  sortOption,
  onFilterStatusChange,
  onSortOptionChange,
  totalPosts,
  isLoading,
}: ScheduleListProps) {
  if (posts.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No scheduled posts"
        description="You haven't scheduled any Instagram posts yet. Go to a flyer and click 'Schedule Instagram Posts' to get started."
      />
    );
  }

  return (
    <div>
      {/* Filters and Sort */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: tokens.textSecondary,
            }}
          >
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) =>
              onFilterStatusChange(e.target.value as ScheduledPostsStatusFilter)
            }
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${tokens.border}`,
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="posting">Posting</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Sort */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: tokens.textSecondary,
            }}
          >
            Sort by
          </label>
          <select
            value={sortOption}
            onChange={(e) =>
              onSortOptionChange(e.target.value as ScheduledPostsSort)
            }
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${tokens.border}`,
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="scheduled_at_desc">Scheduled Time (Newest First)</option>
            <option value="scheduled_at_asc">Scheduled Time (Oldest First)</option>
            <option value="status">Status</option>
            <option value="flyer_title">Flyer Title</option>
          </select>
        </div>

        {/* Results count */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            marginLeft: "auto",
            fontSize: "14px",
            color: tokens.textSecondary,
          }}
        >
          Showing {posts.length} of {totalPosts} posts
        </div>
      </div>

      {
        isLoading ? (
        <div style={{ minHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner message="Loading scheduled posts..." />
      </div>
        ) :(
          posts.length === 0 ? (
            <EmptyState
              title="No posts match your filter"
              description="Try adjusting your filter criteria to see more posts."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {posts.map((post) => (
                <ScheduleItem key={post.id} post={post} onCancel={onRefresh} />
              ))}
            </div>
          )
        )
      }
      
    </div>
  );
}

