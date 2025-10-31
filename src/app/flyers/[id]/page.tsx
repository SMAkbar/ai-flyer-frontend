"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";

export default function FlyerDetailPage() {
  const router = useRouter();
  const params = useParams();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">Loading flyer details...</div>
      </div>
    );
  }

  if (error || !flyer) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            {error || "Flyer not found"}
          </div>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const extraction = flyer.information_extraction;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flyer Image */}
        <div>
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={flyer.cloudfront_url}
              alt={flyer.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Flyer Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{flyer.title}</h1>
            {flyer.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {flyer.description}
              </p>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created: {formatDate(flyer.created_at)}
            </div>
          </div>

          {/* Extracted Information */}
          {extraction && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Extracted Information</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    extraction.status === "completed"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : extraction.status === "processing"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      : extraction.status === "failed"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                  }`}
                >
                  {extraction.status.charAt(0).toUpperCase() + extraction.status.slice(1)}
                </span>
              </div>

              {extraction.status === "completed" ? (
                <div className="space-y-3">
                  {extraction.event_date_time && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Event Date/Time:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {extraction.event_date_time}
                      </p>
                    </div>
                  )}

                  {extraction.location_town_city && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Location:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {extraction.location_town_city}
                      </p>
                    </div>
                  )}

                  {extraction.event_title && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Event Title:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {extraction.event_title}
                      </p>
                    </div>
                  )}

                  {extraction.venue_name && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Venue:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {extraction.venue_name}
                      </p>
                    </div>
                  )}

                  {extraction.performers_djs_soundsystems && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Performers/DJs/Soundsystems:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {extraction.performers_djs_soundsystems}
                      </p>
                    </div>
                  )}

                  {extraction.confidence_level && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Confidence Level:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {parseFloat(extraction.confidence_level) * 100}%
                      </p>
                    </div>
                  )}
                </div>
              ) : extraction.status === "processing" ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Extracting information from flyer image...
                </p>
              ) : extraction.status === "failed" ? (
                <div>
                  <p className="text-red-600 dark:text-red-400 mb-2">
                    Extraction failed
                  </p>
                  {extraction.error_message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {extraction.error_message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Extraction not yet started
                </p>
              )}
            </div>
          )}

          {!extraction && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400">
                No extracted information available yet. Extraction may still be processing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

