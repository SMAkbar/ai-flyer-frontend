"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import { ArrowLeftIcon, CubeIcon, CheckIcon } from "@/components/icons";

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
      <div
        style={{
          width: "90%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: tokens.textSecondary,
            fontSize: "16px",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <circle
              cx="10"
              cy="10"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="44"
              strokeDashoffset="33"
              strokeLinecap="round"
            />
          </svg>
          Loading flyer details...
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
      </div>
    );
  }

  if (error || !flyer) {
    return (
      <div
        style={{
          width: "90%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          gap: "16px",
        }}
      >
        <div
          style={{
            color: tokens.danger,
            fontSize: "16px",
            marginBottom: "8px",
          }}
        >
          {error || "Flyer not found"}
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const extraction = flyer.information_extraction;

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <Button
          variant="secondary"
          onClick={() => router.back()}
          style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <ArrowLeftIcon size={20} color="currentColor" />
        <span>Back</span>
      </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
          gap: "32px",
          marginBottom: "32px",
        }}
      >
        {/* Flyer Image */}
        <div>
          <Card
            style={{
              padding: 0,
              backgroundColor: tokens.bgElevated,
              border: `1px solid ${tokens.border}`,
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                overflow: "hidden",
                backgroundColor: tokens.bgHover,
              }}
            >
              <img
                src={flyer.cloudfront_url}
                alt={flyer.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </Card>
        </div>

        {/* Flyer Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: tokens.textPrimary,
                marginBottom: "12px",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {flyer.title}
            </h1>
            {flyer.description && (
              <p
                style={{
                  fontSize: "16px",
                  color: tokens.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                {flyer.description}
              </p>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: tokens.textMuted,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              Created {formatDate(flyer.created_at)}
            </div>
          </div>

          {/* Extracted Information */}
          {extraction && (
            <Card
              style={{
                backgroundColor: tokens.bgElevated,
                border: `1px solid ${tokens.border}`,
                borderRadius: "16px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: tokens.textPrimary,
                    margin: 0,
                    letterSpacing: "-0.01em",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <CubeIcon size={20} color="currentColor" />
                  Extracted Information
                </h2>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor:
                      extraction.status === "completed"
                        ? `${tokens.success}15`
                        : extraction.status === "processing"
                        ? `${tokens.accent}15`
                        : extraction.status === "failed"
                        ? `${tokens.danger}15`
                        : `${tokens.textMuted}15`,
                    color:
                      extraction.status === "completed"
                        ? tokens.success
                        : extraction.status === "processing"
                        ? tokens.accent
                        : extraction.status === "failed"
                        ? tokens.danger
                        : tokens.textMuted,
                    border: `1px solid ${
                      extraction.status === "completed"
                        ? tokens.success
                        : extraction.status === "processing"
                        ? tokens.accent
                        : extraction.status === "failed"
                        ? tokens.danger
                        : tokens.border
                    }40`,
                  }}
                >
                  {extraction.status.charAt(0).toUpperCase() + extraction.status.slice(1)}
                </span>
              </div>

              {extraction.status === "completed" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {extraction.event_date_time && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: tokens.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Event Date/Time
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: tokens.textPrimary,
                          fontWeight: 500,
                        }}
                      >
                        {extraction.event_date_time}
                      </div>
                    </div>
                  )}

                  {extraction.location_town_city && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: tokens.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Location
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: tokens.textPrimary,
                          fontWeight: 500,
                        }}
                      >
                        {extraction.location_town_city}
                      </div>
                    </div>
                  )}

                  {extraction.event_title && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: tokens.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Event Title
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: tokens.textPrimary,
                          fontWeight: 500,
                        }}
                      >
                        {extraction.event_title}
                      </div>
                    </div>
                  )}

                  {extraction.venue_name && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: tokens.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Venue
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: tokens.textPrimary,
                          fontWeight: 500,
                        }}
                      >
                        {extraction.venue_name}
                      </div>
                    </div>
                  )}

                  {extraction.performers_djs_soundsystems && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: tokens.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Performers/DJs/Soundsystems
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: tokens.textPrimary,
                          fontWeight: 500,
                        }}
                      >
                        {extraction.performers_djs_soundsystems}
                      </div>
                    </div>
                  )}

                  {extraction.confidence_level && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: tokens.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Confidence Level
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          backgroundColor: `${tokens.success}15`,
                          border: `1px solid ${tokens.success}40`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: tokens.success,
                          }}
                        >
                          {Math.round(parseFloat(extraction.confidence_level) * 100)}%
                        </div>
                        <CheckIcon size={16} color={tokens.success} />
                      </div>
                    </div>
                  )}
                </div>
              ) : extraction.status === "processing" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: tokens.textSecondary,
                    padding: "16px",
                    backgroundColor: tokens.bgHover,
                    borderRadius: "12px",
                    border: `1px solid ${tokens.border}`,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke={tokens.accent}
                      strokeWidth="2"
                      strokeDasharray="44"
                      strokeDashoffset="33"
                      strokeLinecap="round"
                    />
                  </svg>
                  Extracting information from flyer image...
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
              ) : extraction.status === "failed" ? (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: `${tokens.danger}15`,
                    borderRadius: "12px",
                    border: `1px solid ${tokens.danger}40`,
                  }}
                >
                  <div
                    style={{
                      color: tokens.danger,
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Extraction failed
                  </div>
                  {extraction.error_message && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: tokens.textSecondary,
                        margin: 0,
                      }}
                    >
                      {extraction.error_message}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: tokens.bgHover,
                    borderRadius: "12px",
                    border: `1px solid ${tokens.border}`,
                    color: tokens.textSecondary,
                    fontSize: "15px",
                  }}
                >
                  Extraction not yet started
                </div>
              )}
            </Card>
          )}

          {!extraction && (
            <Card
              style={{
                backgroundColor: tokens.bgElevated,
                border: `1px solid ${tokens.border}`,
                borderRadius: "16px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: tokens.textSecondary,
                  fontSize: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                No extracted information available yet. Extraction may still be processing.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

