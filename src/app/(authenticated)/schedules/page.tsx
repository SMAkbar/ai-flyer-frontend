"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScheduleList } from "@/components/schedules/ScheduleList";
import { Button } from "@/components/ui/Button";
import { instagramApi, type ScheduledPostWithFlyerRead } from "@/lib/api/instagram";
import { RefreshIcon } from "@/components/icons";

export default function SchedulesPage() {
  const [posts, setPosts] = useState<ScheduledPostWithFlyerRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  async function loadScheduledPosts() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.getAllScheduledPosts();

      if (result.ok) {
        setPosts(result.data.scheduled_posts);
      } else {
        const errorMessage = result.error.status === 404
          ? "Endpoint not found. Please ensure the backend server is running and has been restarted."
          : result.error.message || "Failed to load scheduled posts";
        setError(`${errorMessage} (Status: ${result.error.status})`);
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadScheduledPosts();
  }

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
      isLoading={isLoading}
      loadingMessage="Loading scheduled posts..."
      error={error && posts.length === 0 ? error : null}
      onRetry={loadScheduledPosts}
    >
      <PageHeader
        title="Schedules"
        subtitle="View and manage all your scheduled Instagram posts across all flyers."
        action={refreshButton}
      />

      <ScheduleList posts={posts} onRefresh={handleRefresh} />
    </PageLayout>
  );
}

