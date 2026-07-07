"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScheduleList } from "@/components/schedules/ScheduleList";
import { Button } from "@/components/ui/Button";
import {
  instagramApi,
  type ScheduledPostWithFlyerRead,
  type ScheduledPostsSort,
  type ScheduledPostsStatusFilter,
} from "@/lib/api/instagram";
import { RefreshIcon } from "@/components/icons";
import { tokens } from "@/components/theme/tokens";

export default function SchedulesPage() {
  const PAGE_SIZE = 20;
  const [posts, setPosts] = useState<ScheduledPostWithFlyerRead[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<ScheduledPostsStatusFilter>("all");
  const [sortOption, setSortOption] = useState<ScheduledPostsSort>("scheduled_at_desc");
  const [isListLoading, setIsListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadScheduledPosts(currentPage);
  }, [currentPage, filterStatus, sortOption]);

  async function loadScheduledPosts(page: number) {
    setIsListLoading(true);
    setError(null);

    try {
      const result = await instagramApi.getAllScheduledPosts({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        status: filterStatus,
        sort: sortOption,
      });

      if (result.ok) {
        setPosts(result.data.items);
        setTotalPosts(result.data.total);
      } else {
        const errorMessage = result.error.status === 404
          ? "Endpoint not found. Please ensure the backend server is running and has been restarted."
          : result.error.message || "Failed to load scheduled posts";
        setError(`${errorMessage} (Status: ${result.error.status})`);
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsListLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadScheduledPosts(currentPage);
  }

  function handleFilterStatusChange(value: ScheduledPostsStatusFilter) {
    setCurrentPage(1);
    setFilterStatus(value);
  }

  function handleSortOptionChange(value: ScheduledPostsSort) {
    setCurrentPage(1);
    setSortOption(value);
  }

  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const refreshButton = (
    <Button
      variant="secondary"
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <RefreshIcon size={18} />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </span>
    </Button>
  );

  return (
    <PageLayout
      isLoading={false}
      loadingMessage="Loading scheduled posts..."
      error={error && posts.length === 0 ? error : null}
      onRetry={() => loadScheduledPosts(currentPage)}
    >
      <PageHeader
        title="Schedules"
        subtitle="View and manage all your scheduled Instagram posts across all flyers."
        action={refreshButton}
      />

      <ScheduleList
        posts={posts}
        onRefresh={handleRefresh}
        filterStatus={filterStatus}
        sortOption={sortOption}
        onFilterStatusChange={handleFilterStatusChange}
        onSortOptionChange={handleSortOptionChange}
        totalPosts={totalPosts}
        isLoading={isListLoading}
      />
      {totalPosts > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginTop: "32px",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={isListLoading || isRefreshing || !canGoPrevious}
          >
            Previous
          </Button>
          <span
            style={{
              fontSize: "14px",
              color: tokens.textMuted,
              minWidth: "120px",
              textAlign: "center",
            }}
          >
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={isListLoading || isRefreshing || !canGoNext}
          >
            Next
          </Button>
        </div>
      )}
    </PageLayout>
  );
}
