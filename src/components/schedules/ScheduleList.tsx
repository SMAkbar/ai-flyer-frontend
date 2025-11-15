"use client";

import { useState, useMemo } from "react";
import { ScheduleItem } from "./ScheduleItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { tokens } from "@/components/theme/tokens";
import type { ScheduledPostWithFlyerRead } from "@/lib/api/instagram";

type ScheduleListProps = {
  posts: ScheduledPostWithFlyerRead[];
  onRefresh: () => void;
};

type FilterStatus = "all" | "scheduled" | "posting" | "posted" | "failed" | "pending";
type SortOption = "scheduled_time_asc" | "scheduled_time_desc" | "status" | "flyer_title";

export function ScheduleList({ posts, onRefresh }: ScheduleListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortOption, setSortOption] = useState<SortOption>("scheduled_time_desc");

  const filteredAndSortedPosts = useMemo(() => {
    // Filter
    let filtered = posts;
    if (filterStatus !== "all") {
      filtered = posts.filter(
        (post) => post.post_status === filterStatus
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "scheduled_time_asc":
          const aTime = a.scheduled_at
            ? new Date(a.scheduled_at).getTime()
            : 0;
          const bTime = b.scheduled_at
            ? new Date(b.scheduled_at).getTime()
            : 0;
          return aTime - bTime;

        case "scheduled_time_desc":
          const aTimeDesc = a.scheduled_at
            ? new Date(a.scheduled_at).getTime()
            : 0;
          const bTimeDesc = b.scheduled_at
            ? new Date(b.scheduled_at).getTime()
            : 0;
          return bTimeDesc - aTimeDesc;

        case "status":
          return a.post_status.localeCompare(b.post_status);

        case "flyer_title":
          return a.flyer_title.localeCompare(b.flyer_title);

        default:
          return 0;
      }
    });

    return sorted;
  }, [posts, filterStatus, sortOption]);

  if (posts.length === 0) {
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
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
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
            onChange={(e) => setSortOption(e.target.value as SortOption)}
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
            <option value="scheduled_time_desc">Scheduled Time (Newest First)</option>
            <option value="scheduled_time_asc">Scheduled Time (Oldest First)</option>
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
          Showing {filteredAndSortedPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Posts List */}
      {filteredAndSortedPosts.length === 0 ? (
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
          {filteredAndSortedPosts.map((post) => (
            <ScheduleItem key={post.id} post={post} onCancel={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

