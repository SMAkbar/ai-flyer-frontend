"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout } from "@/components/ui/PageLayout";
import { FlyersGrid } from "@/components/flyers/FlyersGrid";
import { PlusIcon } from "@/components/icons";
import { flyersApi, type FlyerRead, type ExtractionStatus } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";

const POLLING_INTERVAL = 5000; // 5 seconds

type SortOption = "latest" | "oldest";
type FilterStatus = "all" | ExtractionStatus;

export default function FlyersPage() {
  const router = useRouter();
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any flyers are still processing (using extraction_status)
  const hasProcessingFlyers = flyers.some(
    (flyer) => flyer.extraction_status === "processing" || flyer.extraction_status === "pending"
  );

  const loadFlyers = useCallback(async (isPolling = false) => {
    // Only show loading state on initial load, not during polling
    if (!isPolling) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await flyersApi.getAll();

      if (result.ok) {
        setFlyers(result.data);
      } else {
        setError(result.error.message || "Failed to load flyers");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFlyers();
  }, [loadFlyers]);

  // Polling when there are processing flyers
  useEffect(() => {
    if (hasProcessingFlyers && !isLoading) {
      // Start polling
      pollingRef.current = setInterval(() => {
        loadFlyers(true);
      }, POLLING_INTERVAL);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    } else {
      // Stop polling if no processing flyers
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [hasProcessingFlyers, isLoading, loadFlyers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Filter and sort flyers
  const filteredAndSortedFlyers = useMemo(() => {
    let filtered = flyers;

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((flyer) => flyer.extraction_status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((flyer) => {
        const title = (flyer.title || "").toLowerCase();
        const description = (flyer.description || "").toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === "latest") {
        return b.id - a.id; // Descending (newest first)
      } else {
        return a.id - b.id; // Ascending (oldest first)
      }
    });

    return sorted;
  }, [flyers, filterStatus, searchQuery, sortOption]);

  const processingCount = flyers.filter(
    (flyer) => flyer.extraction_status === "processing" || flyer.extraction_status === "pending"
  ).length;

  const createFlyerButton = (
    <Button onClick={() => router.push("/flyers/create")}>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <PlusIcon size={18} />
        Create Flyers
      </span>
    </Button>
  );

  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading flyers..."
      error={error && flyers.length === 0 ? error : null}
      onRetry={() => loadFlyers()}
    >
      <PageHeader
        title="Flyers"
        subtitle="Create, manage, and view all your event flyers. Upload images to extract event information automatically."
        action={createFlyerButton}
      />

      {/* Search, Filter, and Sort Controls */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search Input */}
        <div
          style={{
            flex: "1",
            minWidth: "200px",
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            placeholder="Search flyers by title, description, event details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "14px",
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.accent;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = tokens.border;
            }}
          />
        </div>

        {/* Status Filter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
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
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              color: tokens.textSecondary,
              fontWeight: 500,
            }}
          >
            Sort:
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            style={{
              padding: "10px 14px",
              fontSize: "14px",
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              outline: "none",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.accent;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = tokens.border;
            }}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Processing indicator */}
      {processingCount > 0 && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: `${tokens.accent}15`,
            border: `1px solid ${tokens.accent}40`,
            borderRadius: "12px",
            color: tokens.accent,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ 
              flexShrink: 0,
              animation: "spin 1s linear infinite",
            }}
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="50.3"
              strokeDashoffset="37.7"
              strokeLinecap="round"
            />
          </svg>
          <span>
            {processingCount} flyer{processingCount !== 1 ? "s" : ""} being processed...
            <span style={{ color: tokens.textMuted, marginLeft: "8px" }}>
              (auto-refreshing)
            </span>
          </span>
          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}

      {error && flyers.length > 0 && (
        <Alert variant="error" style={{ marginBottom: "24px" }}>
          {error}
        </Alert>
      )}

      {flyers.length === 0 ? (
        <EmptyState
          title="No flyers yet"
          description="Create your first flyer to get started. Upload an image and we'll automatically extract event information."
          action={createFlyerButton}
        />
      ) : filteredAndSortedFlyers.length === 0 ? (
        <EmptyState
          title="No flyers match your search"
          description={`No flyers found matching "${searchQuery}". Try a different search term.`}
        />
      ) : (
        <FlyersGrid flyers={filteredAndSortedFlyers} />
      )}
    </PageLayout>
  );
}
