"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout } from "@/components/ui/PageLayout";
import { FlyersGrid } from "@/components/flyers/FlyersGrid";
import { PlusIcon } from "@/components/icons";
import { flyersApi, type FlyerRead } from "@/lib/api/flyers";

export default function FlyersPage() {
  const router = useRouter();
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlyers();
  }, []);

  async function loadFlyers() {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }

  const createFlyerButton = (
    <Button onClick={() => router.push("/flyers/create")}>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <PlusIcon size={18} />
        Create Flyer
      </span>
    </Button>
  );

  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading flyers..."
      error={error && flyers.length === 0 ? error : null}
      onRetry={loadFlyers}
    >
      <PageHeader
        title="Flyers"
        subtitle="Create, manage, and view all your event flyers. Upload images to extract event information automatically."
        action={createFlyerButton}
      />

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

