"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await authApi.login({ email, password });
    setLoading(false);
    if (!res.ok) {
      setError(res.error.message || "Login failed");
      return;
    }
    // Store JWT in a cookie for middleware to read
    const token = res.data.access_token;
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${secure}`;
    router.push("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: `linear-gradient(135deg, ${tokens.bgBase} 0%, ${tokens.bgElevated} 100%)`,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "40px",
          backgroundColor: tokens.bgElevated,
          border: `1px solid ${tokens.border}`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
              }}
            >
              <Image
                src="/dub-events-logo.png"
                alt="Dub Events UK"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "8px",
              color: tokens.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Dub Events Dashboard
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: tokens.textSecondary,
              margin: "0 0 4px 0",
            }}
          >
            Event Management & Instagram Automation
          </p>
          <p
            style={{
              fontSize: "14px",
              color: tokens.textMuted,
              margin: "16px 0 0 0",
            }}
          >
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: tokens.textPrimary,
              }}
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: tokens.textPrimary,
              }}
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                color: tokens.danger,
                marginBottom: "20px",
                padding: "12px 16px",
                backgroundColor: `${tokens.danger}15`,
                border: `1px solid ${tokens.danger}40`,
                borderRadius: "8px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v6H7V5zm0 8h2v2H7v-2z"
                  fill="currentColor"
                />
              </svg>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            style={{
              width: "100%",
              padding: "14px 20px",
              fontSize: "16px",
              fontWeight: 600,
              marginTop: "8px",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="37.7"
                    strokeDashoffset="28.3"
                    strokeLinecap="round"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Card>

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
  );
}


