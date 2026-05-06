"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FlyersGrid } from "@/components/flyers/FlyersGrid";
import { PlusIcon } from "@/components/icons";
import { flyersApi, FLYERS_LIST_PAGE_SIZE, type FlyerRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import { type FilterStatus, type SortOption } from "@/lib/utils/flyerFilters";

const POLLING_INTERVAL = 5000; // 5 seconds

function toApiStatusFilter(status: FilterStatus) {
  // "completed" can come from shared filter type; backend expects "extracted".
  if (status === "completed") return "extracted";
  return status;
}

function FlyersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [total, setTotal] = useState(0);
  const [extractionsActive, setExtractionsActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pageRef = useRef(1);
  const hasLoadedInitiallyRef = useRef(false);

  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / FLYERS_LIST_PAGE_SIZE));
  const currentPage = Math.min(pageFromUrl, totalPages);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    pageRef.current = currentPage;
  }, [currentPage]);

  const loadPageFromUrl = useCallback(
    async (
      requestedPage: number,
      searchTerm: string,
      statusFilter: FilterStatus,
      sortBy: SortOption,
      options?: { isPolling?: boolean }
    ) => {
      const isPolling = options?.isPolling ?? false;
      if (!isPolling) {
        if (hasLoadedInitiallyRef.current) {
          setIsListLoading(true);
        } else {
          setIsLoading(true);
        }
      }
      setError(null);

      let page = Math.max(1, requestedPage);
      let skip = (page - 1) * FLYERS_LIST_PAGE_SIZE;
      let result = await flyersApi.getPage({
        skip,
        limit: FLYERS_LIST_PAGE_SIZE,
        search: searchTerm,
        status: toApiStatusFilter(statusFilter),
        sort: sortBy,
      });

      if (!result.ok) {
        setError(result.error.message || "Failed to load flyers");
        if (!isPolling) {
          if (hasLoadedInitiallyRef.current) setIsListLoading(false);
          else {
            setIsLoading(false);
            hasLoadedInitiallyRef.current = true;
          }
        }
        return;
      }

      const totalFromApi = result.data.total;
      const pages = Math.max(1, Math.ceil(totalFromApi / FLYERS_LIST_PAGE_SIZE));
      if (page > pages) {
        page = pages;
        skip = (page - 1) * FLYERS_LIST_PAGE_SIZE;
        result = await flyersApi.getPage({
          skip,
          limit: FLYERS_LIST_PAGE_SIZE,
          search: searchTerm,
          status: toApiStatusFilter(statusFilter),
          sort: sortBy,
        });
        if (!result.ok) {
          setError(result.error.message || "Failed to load flyers");
          if (!isPolling) {
            if (hasLoadedInitiallyRef.current) setIsListLoading(false);
            else {
              setIsLoading(false);
              hasLoadedInitiallyRef.current = true;
            }
          }
          return;
        }
      }

      const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
      if (page !== urlPage) {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) params.delete("page");
        else params.set("page", String(page));
        const q = params.toString();
        router.replace(q ? `${pathname}?${q}` : pathname);
      }

      setFlyers(result.data.items);
      setTotal(result.data.total);
      setExtractionsActive(result.data.extractions_active ?? 0);
      if (!isPolling) {
        if (hasLoadedInitiallyRef.current) {
          setIsListLoading(false);
        } else {
          setIsLoading(false);
          hasLoadedInitiallyRef.current = true;
        }
      }
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const requestedPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    void loadPageFromUrl(
      requestedPage,
      debouncedSearchQuery,
      filterStatus,
      sortOption
    );
  }, [searchParams, debouncedSearchQuery, filterStatus, sortOption, loadPageFromUrl]);

  useEffect(() => {
    if (extractionsActive <= 0 || isLoading) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    pollingRef.current = setInterval(() => {
      void loadPageFromUrl(pageRef.current, debouncedSearchQuery, filterStatus, sortOption, {
        isPolling: true,
      });
    }, POLLING_INTERVAL);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    extractionsActive,
    isLoading,
    debouncedSearchQuery,
    filterStatus,
    sortOption,
    loadPageFromUrl,
  ]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const filterKey = `${searchQuery}|${filterStatus}|${sortOption}`;
  const prevFilterKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterKey;
      return;
    }
    if (prevFilterKeyRef.current === filterKey) return;
    prevFilterKeyRef.current = filterKey;
    if (!searchParams.get("page")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }, [filterKey, pathname, router, searchParams]);

  const goToPage = useCallback(
    (next: number) => {
      const pages = Math.max(1, Math.ceil(total / FLYERS_LIST_PAGE_SIZE));
      const p = Math.max(1, Math.min(next, pages));
      const params = new URLSearchParams(searchParams.toString());
      if (p <= 1) params.delete("page");
      else params.set("page", String(p));
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    },
    [pathname, router, searchParams, total]
  );

  const reloadCurrentPage = useCallback(() => {
    void loadPageFromUrl(
      pageRef.current,
      debouncedSearchQuery,
      filterStatus,
      sortOption
    );
  }, [loadPageFromUrl, debouncedSearchQuery, filterStatus, sortOption]);

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
      error={error && total === 0 ? error : null}
      onRetry={() =>
        void loadPageFromUrl(
          pageFromUrl,
          debouncedSearchQuery,
          filterStatus,
          sortOption
        )
      }
    >
      <PageHeader
        title="Flyers"
        subtitle="Create, manage, and view all your event flyers. Upload images to extract event information automatically."
        action={createFlyerButton}
      />

      <p
        style={{
          margin: "-8px 0 20px",
          fontSize: "13px",
          color: tokens.textMuted,
        }}
      >
        Search runs across all your flyers. Status filters apply to the current page results.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flex: "1",
            minWidth: "240px",
            maxWidth: "400px",
            position: "relative",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={tokens.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search flyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              fontSize: "14px",
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.accent;
              e.target.style.boxShadow = `0 0 0 3px ${tokens.accent}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = tokens.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            style={{
              padding: "10px 32px 10px 14px",
              fontSize: "14px",
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              outline: "none",
              cursor: "pointer",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.accent;
              e.target.style.boxShadow = `0 0 0 3px ${tokens.accent}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = tokens.border;
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="extracted">Extracted</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
          </select>

          <div
            style={{
              width: "1px",
              height: "24px",
              backgroundColor: tokens.border,
            }}
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            style={{
              padding: "10px 32px 10px 14px",
              fontSize: "14px",
              backgroundColor: tokens.bgElevated,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              outline: "none",
              cursor: "pointer",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.accent;
              e.target.style.boxShadow = `0 0 0 3px ${tokens.accent}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = tokens.border;
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="latest">Newest First - Created Date</option>
            <option value="oldest">Oldest First - Created Date</option>
            <option value="latest_event">Newest First - Event Date</option>
            <option value="oldest_event">Oldest First - Event Date</option>
          </select>
        </div>
      </div>

      {extractionsActive > 0 && (
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
            {extractionsActive} extraction{extractionsActive !== 1 ? "s" : ""} still running…
            <span style={{ color: tokens.textMuted, marginLeft: "8px" }}>(auto-refreshing this page)</span>
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

      {error && total > 0 && (
        <Alert variant="error" style={{ marginBottom: "24px" }}>
          {error}
        </Alert>
      )}

      {total === 0 ? (
        <EmptyState
          title="No flyers yet"
          description="Create your first flyer to get started. Upload an image and we'll automatically extract event information."
          action={createFlyerButton}
        />
      ) : isListLoading ? (
        <div
          style={{
            minHeight: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner message="Loading flyers..." />
        </div>
      ) : flyers.length === 0 ? (
        <EmptyState
          title="No flyers match on this page"
          description={`No flyers on page ${currentPage} match your search or filters. Try another page or clear filters.`}
        />
      ) : (
        <>
          <FlyersGrid
            flyers={flyers}
            onDelete={reloadCurrentPage}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            sortOption={sortOption}
          />
          {totalPages > 1 && (
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
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
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
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

export default function FlyersPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading flyers..." />}>
      <FlyersPageContent />
    </Suspense>
  );
}
