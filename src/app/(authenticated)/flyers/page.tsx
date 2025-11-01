"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FlyerCard } from "@/components/flyers/FlyerCard";
import { flyersApi, type FlyerRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";

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
          Loading flyers...
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

  if (error && flyers.length === 0) {
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
          {error}
        </div>
        <Button onClick={loadFlyers}>Retry</Button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: tokens.textPrimary,
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            Flyers
          </h1>
          <p
            style={{
              color: tokens.textSecondary,
              fontSize: "16px",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Create, manage, and view all your event flyers. Upload images to extract event information automatically.
          </p>
        </div>
        <Button onClick={() => router.push("/flyers/create")}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Flyer
          </span>
        </Button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: `${tokens.danger}15`,
            border: `1px solid ${tokens.danger}40`,
            borderRadius: "12px",
            color: tokens.danger,
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
            style={{ flexShrink: 0 }}
          >
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              fill="currentColor"
            />
          </svg>
          {error}
        </div>
      )}

      {flyers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              borderRadius: "20px",
              backgroundColor: tokens.bgHover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${tokens.border}`,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: tokens.textPrimary,
              marginBottom: "8px",
            }}
          >
            No flyers yet
          </h2>
          <p
            style={{
              color: tokens.textSecondary,
              fontSize: "15px",
              marginBottom: "24px",
              maxWidth: "400px",
              margin: "0 auto 24px",
            }}
          >
            Create your first flyer to get started. Upload an image and we'll automatically extract event information.
          </p>
          <Button onClick={() => router.push("/flyers/create")}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Flyer
            </span>
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            gap: "24px",
          }}
        >
          {flyers.map((flyer) => (
            <FlyerCard key={flyer.id} flyer={flyer} />
          ))}
        </div>
      )}
    </div>
  );
}

