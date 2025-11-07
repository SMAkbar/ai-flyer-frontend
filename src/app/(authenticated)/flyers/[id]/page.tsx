"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { Container } from "@/components/ui/Container";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";
import { FlyerImageCard } from "@/components/flyers/FlyerImageCard";
import { FlyerHeader } from "@/components/flyers/FlyerHeader";
import { ExtractionCard } from "@/components/flyers/ExtractionCard";
import { GeneratedImagesSection } from "@/components/flyers/GeneratedImagesSection";

export default function FlyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params?.id ? parseInt(params.id as string, 10) : null;

  const [flyer, setFlyer] = useState<FlyerDetailRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (flyerId) {
      loadFlyer();
    }
    
    // Cleanup polling timeout on unmount
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
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

  const handleGenerateImages = async () => {
    if (!flyerId || !flyer?.information_extraction) return;

    setIsGeneratingImages(true);
    setError(null);

    try {
      const result = await flyersApi.generateImages(flyerId);

      if (result.ok) {
        // Poll for images - check every 3 seconds up to 60 times (3 minutes max)
        // Image generation can take 30-90 seconds for multiple images
        const maxAttempts = 60;
        const pollInterval = 3000; // 3 seconds
        let attempts = 0;
        
        // Clear any existing polling timeout
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
        
        const pollForImages = () => {
          attempts++;
          flyersApi.getById(flyerId).then((pollResult) => {
            if (pollResult.ok && pollResult.data.generated_images && pollResult.data.generated_images.length > 0) {
              // Images are ready
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              setFlyer(pollResult.data);
              setIsGeneratingImages(false);
            } else if (attempts < maxAttempts) {
              // Continue polling
              pollingTimeoutRef.current = setTimeout(pollForImages, pollInterval);
            } else {
              // Give up after max attempts (3 minutes)
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              setIsGeneratingImages(false);
              // Still reload to get latest state
              loadFlyer();
              // Show a message that it's taking longer than expected
              setError("Image generation is taking longer than expected. Please refresh the page to check for images.");
            }
          }).catch(() => {
            // On error, stop polling but continue checking
            if (attempts < maxAttempts) {
              // Retry on error (network issues, etc.)
              pollingTimeoutRef.current = setTimeout(pollForImages, pollInterval);
            } else {
              // Give up after max attempts
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              setIsGeneratingImages(false);
            }
          });
        };
        
        // Start polling after initial delay
        pollingTimeoutRef.current = setTimeout(pollForImages, pollInterval);
      } else {
        setError(result.error.message || "Failed to generate images");
        setIsGeneratingImages(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsGeneratingImages(false);
    }
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
                  onGenerateImages={handleGenerateImages}
                  isGeneratingImages={isGeneratingImages}
                  hasGeneratedImages={
                    flyer.generated_images !== null &&
                    flyer.generated_images !== undefined &&
                    flyer.generated_images.length > 0
                  }
                />
              </div>
            </div>

            {flyer.information_extraction?.status === "completed" && (
              <div style={{ marginTop: "24px" }}>
                <GeneratedImagesSection
                  images={flyer.generated_images}
                  isLoading={isGeneratingImages}
                  isGenerating={isGeneratingImages}
                />
                {flyer.generated_images && flyer.generated_images.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <Button
                      onClick={() => router.push(`/flyers/${flyer.id}/instagram`)}
                      variant="primary"
                    >
                      Schedule Instagram Posts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
}

