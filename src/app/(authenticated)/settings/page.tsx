"use client";

import { useState, useEffect } from "react";
import { settingsApi, type UserMetaSettings, type UserMetaSettingsUpdate } from "@/lib/api/settings";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserMetaSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<UserMetaSettingsUpdate>({
    meta_app_id: "",
    meta_app_secret: "",
    meta_access_token: "",
    instagram_user_id: "",
    instagram_username: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);
    const res = await settingsApi.getMetaSettings();
    setIsLoading(false);

    if (!res.ok) {
      // 404 means settings not configured yet, which is fine
      if (res.error.status === 404) {
        setSettings(null);
        return;
      }
      setError(res.error.message || "Failed to load settings");
      return;
    }

    setSettings(res.data);
    setFormData({
      meta_app_id: res.data.meta_app_id,
      meta_app_secret: res.data.meta_app_secret,
      meta_access_token: res.data.meta_access_token,
      instagram_user_id: res.data.instagram_user_id,
      instagram_username: res.data.instagram_username || "",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const res = await settingsApi.updateMetaSettings(formData);
    setIsSaving(false);

    if (!res.ok) {
      setError(res.error.message || "Failed to update settings");
      return;
    }

    setSettings(res.data);
    setSuccessMessage("Settings saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  if (isLoading) {
    return (
      <div
        style={{
          width: "90%",
          margin: "0 auto",
          maxWidth: "1600px",
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
          Loading settings...
        </div>
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

  return (
    <div
      style={{
        width: "90%",
        margin: "0 auto",
        maxWidth: "1600px",
      }}
    >
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: tokens.textSecondary,
            margin: 0,
          }}
        >
          Configure your Meta/Instagram API credentials
        </p>
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

      {successMessage && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: `${tokens.success}15`,
            border: `1px solid ${tokens.success}40`,
            borderRadius: "12px",
            color: tokens.success,
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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L10 9.586l2.793-2.793a1 1 0 011.414 1.414z"
              fill="currentColor"
            />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Meta Settings Section */}
      <div
        style={{
          backgroundColor: tokens.bgElevated,
          border: `1px solid ${tokens.border}`,
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          Meta/Instagram API Settings
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: tokens.textSecondary,
            marginBottom: "24px",
          }}
        >
          Configure your Meta App credentials and Instagram Business Account ID. These credentials are encrypted and stored securely.
        </p>

        <form onSubmit={handleSave}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div>
              <label
                htmlFor="meta_app_id"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tokens.textPrimary,
                  marginBottom: "8px",
                }}
              >
                Meta App ID <span style={{ color: tokens.danger }}>*</span>
              </label>
              <input
                type="text"
                id="meta_app_id"
                name="meta_app_id"
                value={formData.meta_app_id}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgBase,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                }}
                placeholder="e.g., 1484696049280549"
              />
            </div>

            <div>
              <label
                htmlFor="meta_app_secret"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tokens.textPrimary,
                  marginBottom: "8px",
                }}
              >
                Meta App Secret <span style={{ color: tokens.danger }}>*</span>
              </label>
              <input
                type="password"
                id="meta_app_secret"
                name="meta_app_secret"
                value={formData.meta_app_secret}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgBase,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                }}
                placeholder="Enter your Meta App Secret"
              />
            </div>

            <div>
              <label
                htmlFor="meta_access_token"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tokens.textPrimary,
                  marginBottom: "8px",
                }}
              >
                Meta Access Token <span style={{ color: tokens.danger }}>*</span>
              </label>
              <textarea
                id="meta_access_token"
                name="meta_access_token"
                value={formData.meta_access_token}
                onChange={handleChange}
                required
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgBase,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  resize: "vertical",
                }}
                placeholder="Enter your Meta Access Token (long-lived token recommended)"
              />
            </div>

            <div>
              <label
                htmlFor="instagram_user_id"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tokens.textPrimary,
                  marginBottom: "8px",
                }}
              >
                Instagram Business Account ID <span style={{ color: tokens.danger }}>*</span>
              </label>
              <input
                type="text"
                id="instagram_user_id"
                name="instagram_user_id"
                value={formData.instagram_user_id}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgBase,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                }}
                placeholder="e.g., 17841472052179284"
              />
            </div>

            <div>
              <label
                htmlFor="instagram_username"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tokens.textPrimary,
                  marginBottom: "8px",
                }}
              >
                Instagram Username (Optional)
              </label>
              <input
                type="text"
                id="instagram_username"
                name="instagram_username"
                value={formData.instagram_username || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgBase,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "8px",
                  fontFamily: "inherit",
                }}
                placeholder="e.g., @smakbar42"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: `1px solid ${tokens.border}`,
            }}
          >
            <Button
              type="submit"
              disabled={isSaving}
              style={{
                minWidth: "120px",
              }}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

