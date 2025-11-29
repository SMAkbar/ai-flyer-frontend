"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout } from "@/components/ui/PageLayout";
import { FlyersGrid } from "@/components/flyers/FlyersGrid";
import { PlusIcon } from "@/components/icons";
import { flyersApi, type FlyerRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";

const POLLING_INTERVAL = 5000; // 5 seconds

export default function FlyersPage() {
  const router = useRouter();
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any flyers are still processing
  const hasProcessingFlyers = flyers.some(
    (flyer) => flyer.title === "Processing..."
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

  const processingCount = flyers.filter(
    (flyer) => flyer.title === "Processing..."
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
      ) : (
        <FlyersGrid flyers={flyers} />
      )}
    </PageLayout>
  );
}
