"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

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
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Sign in</h1>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </div>
        {error && (
          <div style={{ color: "#b00020", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, borderRadius: 6, background: "#111827", color: "white" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}


