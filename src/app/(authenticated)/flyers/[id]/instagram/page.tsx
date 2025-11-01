"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { Container } from "@/components/ui/Container";
import { BackButton } from "@/components/ui/BackButton";
import { InstagramSchedulingPage } from "@/components/flyers/InstagramSchedulingPage";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";

export default function InstagramPostingPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params?.id ? parseInt(params.id as string, 10) : null;

  const [flyer, setFlyer] = useState<FlyerDetailRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flyerId) {
      loadFlyer();
    }
  }, [flyerId]);

  async function loadFlyer() {
    if (!flyerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await flyersApi.getById(flyerId);

      if (result.ok) {
        setFlyer(result.data);
      } else {
        setError(result.error.message || "Failed to load flyer");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading flyer..."
      error={error || (!flyer ? "Flyer not found" : null)}
      onRetry={loadFlyer}
    >
      <Container>
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>

        {flyer && (
          <InstagramSchedulingPage
            flyer={flyer}
            onBack={() => router.push(`/flyers/${flyer.id}`)}
          />
        )}
      </Container>
    </PageLayout>
  );
}

