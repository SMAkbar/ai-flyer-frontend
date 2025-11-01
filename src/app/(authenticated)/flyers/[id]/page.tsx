"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { Container } from "@/components/ui/Container";
import { BackButton } from "@/components/ui/BackButton";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";
import { FlyerImageCard } from "@/components/flyers/FlyerImageCard";
import { FlyerHeader } from "@/components/flyers/FlyerHeader";
import { ExtractionCard } from "@/components/flyers/ExtractionCard";
import { GeneratedImagesSection } from "@/components/flyers/GeneratedImagesSection";

export default function FlyerDetailPage() {
  const params = useParams();
  const flyerId = params?.id ? parseInt(params.id as string, 10) : null;

  const [flyer, setFlyer] = useState<FlyerDetailRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleFieldEdit = (fieldName: string, currentValue: string | null) => {
    setEditingField(fieldName);
    setEditingValue(currentValue || "");
  };

  const handleFieldChange = (value: string) => {
    setEditingValue(value);
  };

  const handleFieldSave = async (fieldName: string) => {
    if (!flyerId || !flyer?.information_extraction) return;

    setIsUpdating(true);
    try {
      const updateData: Record<string, string | null> = {};
      updateData[fieldName] = editingValue.trim() || null;

      const result = await flyersApi.updateExtraction(flyerId, updateData);

      if (result.ok) {
        setFlyer((prev) => {
          if (!prev || !prev.information_extraction) return prev;
          return {
            ...prev,
            information_extraction: {
              ...prev.information_extraction,
              ...result.data,
            },
          };
        });
        setEditingField(null);
        setEditingValue("");
      } else {
        setError(result.error.message || "Failed to update field");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditingValue("");
  };

  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading flyer details..."
      error={error || (!flyer ? "Flyer not found" : null)}
      onRetry={loadFlyer}
    >
      <Container>
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>

        {flyer && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "350px 1fr",
                gap: "12px",
                marginBottom: "32px",
                alignItems: "start",
              }}
            >
              <FlyerImageCard imageUrl={flyer.cloudfront_url} alt={flyer.title} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  margin: 0,
                  padding: 0,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <FlyerHeader
                  title={flyer.title}
                  description={flyer.description}
                  createdAt={flyer.created_at}
                />

                <ExtractionCard
                  extraction={flyer.information_extraction}
                  editingField={editingField}
                  editingValue={editingValue}
                  isUpdating={isUpdating}
                  onFieldEdit={handleFieldEdit}
                  onFieldChange={handleFieldChange}
                  onFieldSave={handleFieldSave}
                  onFieldCancel={handleFieldCancel}
                />
              </div>
            </div>

            {flyer.information_extraction?.status === "completed" && (
              <div style={{ marginTop: "24px" }}>
                <GeneratedImagesSection
                  images={flyer.generated_images}
                  isLoading={
                    !flyer.generated_images || flyer.generated_images.length === 0
                  }
                />
              </div>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
}

