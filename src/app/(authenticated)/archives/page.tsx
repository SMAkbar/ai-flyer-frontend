"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FlyersGrid } from "@/components/flyers/FlyersGrid";
import { FLYERS_LIST_PAGE_SIZE, type FlyerRead } from "@/lib/api/flyers";
import { archivesApi } from "@/lib/api/archives";
import { tokens } from "@/components/theme/tokens";

function ArchivesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / FLYERS_LIST_PAGE_SIZE));
  const currentPage = Math.min(pageFromUrl, totalPages);

  const loadPageFromUrl = useCallback(
    async (requestedPage: number) => {
      if (hasLoadedInitially) {
        setIsListLoading(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      let page = Math.max(1, requestedPage);
      let skip = (page - 1) * FLYERS_LIST_PAGE_SIZE;
      let result = await archivesApi.get({
        skip,
        limit: FLYERS_LIST_PAGE_SIZE,
      });

      if (!result.ok) {
        setError(result.error.message || "Failed to load archives");
        if (hasLoadedInitially) setIsListLoading(false);
        else {
          setIsLoading(false);
          setHasLoadedInitially(true);
        }
        return;
      }

      const totalFromApi = result.data.total;
      const pages = Math.max(1, Math.ceil(totalFromApi / FLYERS_LIST_PAGE_SIZE));
      if (page > pages) {
        page = pages;
        skip = (page - 1) * FLYERS_LIST_PAGE_SIZE;
        result = await archivesApi.get({
          skip,
          limit: FLYERS_LIST_PAGE_SIZE,
        });
        if (!result.ok) {
          setError(result.error.message || "Failed to load archives");
          if (hasLoadedInitially) setIsListLoading(false);
          else {
            setIsLoading(false);
            setHasLoadedInitially(true);
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
      if (hasLoadedInitially) {
        setIsListLoading(false);
      } else {
        setIsLoading(false);
        setHasLoadedInitially(true);
      }
    },
    [hasLoadedInitially, pathname, router, searchParams]
  );

  useEffect(() => {
    const requestedPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    void loadPageFromUrl(requestedPage);
  }, [searchParams, loadPageFromUrl]);

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
    void loadPageFromUrl(currentPage);
  }, [currentPage, loadPageFromUrl]);

  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading archives..."
      error={error && total === 0 ? error : null}
      onRetry={() => void loadPageFromUrl(pageFromUrl)}
    >
      <PageHeader
        title="Archives"
        subtitle="Browse archived flyers in a paginated list."
      />

      {/* <p
        style={{
          margin: "-8px 0 20px",
          fontSize: "13px",
          color: tokens.textMuted,
        }}
      >
        Archives use the same flyer source and default pagination settings.
      </p> */}

      {error && total > 0 && (
        <Alert variant="error" style={{ marginBottom: "24px" }}>
          {error}
        </Alert>
      )}

      {total === 0 ? (
        <EmptyState
          title="No archived flyers yet"
          description="Archived flyers will appear here once available."
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
          <LoadingSpinner message="Loading archives..." />
        </div>
      ) : flyers.length === 0 ? (
        <EmptyState
          title="No archives on this page"
          description={`No archived flyers are available on page ${currentPage}.`}
        />
      ) : (
        <>
          <FlyersGrid
            flyers={flyers}
            disableNavigation
            hideDelete
            showUnarchive
            onUnarchive={reloadCurrentPage}
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

export default function ArchivesPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading archives..." />}>
      <ArchivesPageContent />
    </Suspense>
  );
}
