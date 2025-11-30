"use client";

import { useState, useEffect } from "react";
import { 
  settingsApi, 
  type UserMetaSettings, 
  type UserMetaSettingsUpdate,
  type UserWordPressSettings,
  type UserWordPressSettingsUpdate,
} from "@/lib/api/settings";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";

export default function SettingsPage() {
  // Meta/Instagram state
  const [settings, setSettings] = useState<UserMetaSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // WordPress state
  const [wpSettings, setWpSettings] = useState<UserWordPressSettings | null>(null);
  const [isWpLoading, setIsWpLoading] = useState(true);
  const [isWpSaving, setIsWpSaving] = useState(false);
  const [isWpTesting, setIsWpTesting] = useState(false);
  const [wpError, setWpError] = useState<string | null>(null);
  const [wpSuccessMessage, setWpSuccessMessage] = useState<string | null>(null);
  
  // Meta form state
  const [formData, setFormData] = useState<UserMetaSettingsUpdate>({
    meta_app_id: "",
    meta_app_secret: "",
    meta_access_token: null,
    instagram_user_id: "",
  });
  
  // WordPress form state (wordpress_site_url is NOT included - it's system-configured)
  const [wpFormData, setWpFormData] = useState<UserWordPressSettingsUpdate>({
    wordpress_username: "",
    wordpress_app_password: null,
    is_enabled: true,
  });

  useEffect(() => {
    loadSettings();
    loadWordPressSettings();
    
    // Handle OAuth callback
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const oauth = urlParams.get("oauth");

      if (oauth === "meta" && code && state) {
        handleOAuthCallback(code, state);
      }
    }
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
      meta_access_token: res.data.meta_access_token || null,
      instagram_user_id: res.data.instagram_user_id,
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
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value === "" ? null : value 
    }));
  }

  async function handleConnectWithMeta() {
    setIsOAuthLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First, ensure settings are saved (if they exist but aren't saved yet)
      // The backend requires settings to be saved before OAuth
      const needsSaving = !settings || 
          settings.meta_app_id !== formData.meta_app_id ||
          settings.meta_app_secret !== formData.meta_app_secret ||
          settings.instagram_user_id !== formData.instagram_user_id;
      
      if (needsSaving) {
        // Auto-save settings first
        const saveRes = await settingsApi.updateMetaSettings({
          meta_app_id: formData.meta_app_id,
          meta_app_secret: formData.meta_app_secret,
          instagram_user_id: formData.instagram_user_id,
          meta_access_token: formData.meta_access_token,
        });
        
        if (!saveRes.ok) {
          setError(saveRes.error.message || "Failed to save settings. Please save manually first.");
          setIsOAuthLoading(false);
          return;
        }
        
        // Update local state
        setSettings(saveRes.data);
      }

      const res = await settingsApi.getOAuthAuthorizeUrl();
      if (!res.ok) {
        let errorMessage = res.error.message || "Failed to generate OAuth URL";
        
        // Provide helpful guidance for common errors
        if (errorMessage.includes("Invalid Meta App ID") || errorMessage.includes("App ID")) {
          errorMessage += "\n\nPlease verify:\n• Your App ID is correct (found in Meta App Settings > Basic)\n• The App ID is numeric only (no spaces or special characters)\n• You're using the App ID (not the App Secret)\n• The redirect URI is configured in Meta App Settings > Facebook Login > Settings";
        }
        
        setError(errorMessage);
        setIsOAuthLoading(false);
        return;
      }

      // Store state token in sessionStorage for validation on callback
      sessionStorage.setItem("meta_oauth_state", res.data.state);

      // Redirect to Meta OAuth URL
      window.location.href = res.data.auth_url;
    } catch (err) {
      setError("Failed to initiate OAuth flow");
      setIsOAuthLoading(false);
    }
  }

  async function handleOAuthCallback(code: string, state: string) {
    setIsOAuthLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate state token
      const storedState = sessionStorage.getItem("meta_oauth_state");
      if (!storedState || storedState !== state) {
        setError("Invalid OAuth state token. Please try again.");
        setIsOAuthLoading(false);
        sessionStorage.removeItem("meta_oauth_state");
        return;
      }

      // Clear state token
      sessionStorage.removeItem("meta_oauth_state");

      // Exchange code for token
      const res = await settingsApi.handleOAuthCallback({ code, state });
      if (!res.ok) {
        let errorMessage = res.error.message || "Failed to complete OAuth flow";
        
        // Provide helpful guidance for OAuth errors
        if (errorMessage.includes("Invalid App ID") || errorMessage.includes("PLATFORM__INVALID_APP_ID")) {
          errorMessage = "Invalid Meta App ID. Please check:\n\n" +
            "1. Your App ID is correct (found in Meta App Settings > Basic)\n" +
            "2. The App ID contains only numbers (no spaces or special characters)\n" +
            "3. You're using the App ID, not the App Secret\n" +
            "4. The redirect URI is added in Meta App Settings > Facebook Login > Settings:\n" +
            "   - Development: http://localhost:3000/settings?oauth=meta\n" +
            "   - Production: https://yourdomain.com/settings?oauth=meta";
        }
        
        setError(errorMessage);
        setIsOAuthLoading(false);
        return;
      }

      // Reload settings to get updated token
      await loadSettings();
      setSuccessMessage(res.data.message || "Successfully connected to Meta!");
      
      // Clear URL parameters
      window.history.replaceState({}, "", "/settings");
    } catch (err) {
      setError("Failed to complete OAuth flow");
    } finally {
      setIsOAuthLoading(false);
    }
  }

  // =============================================================================
  // WordPress Functions
  // =============================================================================

  async function loadWordPressSettings() {
    setIsWpLoading(true);
    setWpError(null);
    const res = await settingsApi.getWordPressSettings();
    setIsWpLoading(false);

    if (!res.ok) {
      // 404 means settings not configured yet, which is fine
      if (res.error.status === 404) {
        setWpSettings(null);
        return;
      }
      setWpError(res.error.message || "Failed to load WordPress settings");
      return;
    }

    setWpSettings(res.data);
    // Note: wordpress_site_url is NOT set in form - it's read-only from server
    setWpFormData({
      wordpress_username: res.data.wordpress_username,
      wordpress_app_password: null, // Don't populate the password
      is_enabled: res.data.is_enabled,
    });
  }

  async function handleWpSave(e: React.FormEvent) {
    e.preventDefault();
    setIsWpSaving(true);
    setWpError(null);
    setWpSuccessMessage(null);

    const res = await settingsApi.updateWordPressSettings(wpFormData);
    setIsWpSaving(false);

    if (!res.ok) {
      setWpError(res.error.message || "Failed to update WordPress settings");
      return;
    }

    setWpSettings(res.data);
    setWpFormData((prev) => ({
      ...prev,
      wordpress_app_password: null, // Clear password after save
    }));
    setWpSuccessMessage("WordPress settings saved successfully!");
    setTimeout(() => setWpSuccessMessage(null), 3000);
  }

  function handleWpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setWpFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (value === "" ? null : value),
    }));
  }

  async function handleTestWpConnection() {
    setIsWpTesting(true);
    setWpError(null);
    setWpSuccessMessage(null);

    // Validate required fields
    if (!wpFormData.wordpress_username) {
      setWpError("Please enter a WordPress username");
      setIsWpTesting(false);
      return;
    }

    // Use form password if entered, otherwise use saved password (if testing saved settings)
    const passwordToTest = wpFormData.wordpress_app_password;
    if (!passwordToTest && !wpSettings) {
      setWpError("Please enter an Application Password");
      setIsWpTesting(false);
      return;
    }

    if (!passwordToTest) {
      setWpError("Please enter the Application Password to test (saved passwords are not shown for security)");
      setIsWpTesting(false);
      return;
    }

    try {
      const res = await settingsApi.testWordPressConnection({
        wordpress_username: wpFormData.wordpress_username,
        wordpress_app_password: passwordToTest,
      });

      if (!res.ok) {
        setWpError(res.error.message || "Connection test failed");
        setIsWpTesting(false);
        return;
      }

      setWpSuccessMessage(`Connected successfully as ${res.data.user_name || "WordPress user"}`);
    } catch {
      setWpError("Failed to test connection");
    } finally {
      setIsWpTesting(false);
    }
  }

  // =============================================================================
  // Meta OAuth Helpers
  // =============================================================================

  // Check if OAuth button should be shown
  // Show button if required fields are filled (either in saved settings or form data)
  const shouldShowOAuthButton = () => {
    // Check if we have the required fields in either settings or formData
    const hasAppId = settings?.meta_app_id || formData.meta_app_id;
    const hasAppSecret = settings?.meta_app_secret || formData.meta_app_secret;
    const hasInstagramUserId = settings?.instagram_user_id || formData.instagram_user_id;
    
    return hasAppId && hasAppSecret && hasInstagramUserId;
  };
  
  // Check if we should show "Connect" (no token) vs "Reconnect" (has token)
  const getOAuthButtonText = () => {
    const hasToken = settings?.meta_access_token || formData.meta_access_token;
    if (hasToken) {
      return isOAuthLoading ? "Reconnecting..." : "Reconnect with Meta";
    }
    return isOAuthLoading ? "Connecting..." : "Connect with Meta";
  };

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
            marginBottom: "16px",
          }}
        >
          Configure your Meta App credentials, Instagram Business Account ID, and Access Token. These credentials are encrypted and stored securely.
        </p>
        
        <div
          style={{
            marginBottom: "24px",
            padding: "12px 16px",
            backgroundColor: tokens.bgBase,
            border: `1px solid ${tokens.border}`,
            borderRadius: "8px",
            fontSize: "13px",
          }}
        >
          <p style={{ margin: 0, marginBottom: "8px", fontWeight: 500, color: tokens.textPrimary }}>
            ⚠️ Important: Before using OAuth, configure the redirect URI in Meta App Settings:
          </p>
          <ol style={{ margin: 0, paddingLeft: "20px", color: tokens.textSecondary }}>
            <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" style={{ color: tokens.accent }}>Meta App Dashboard</a></li>
            <li>Select your app → <strong>Facebook Login</strong> → <strong>Settings</strong></li>
            <li>Add this redirect URI to <strong>"Valid OAuth Redirect URIs"</strong>:</li>
          </ol>
          <code
            style={{
              display: "block",
              marginTop: "8px",
              padding: "8px 12px",
              backgroundColor: tokens.bgElevated,
              border: `1px solid ${tokens.border}`,
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/settings?oauth=meta
          </code>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: tokens.textSecondary, fontStyle: "italic" }}>
            Also ensure <strong>Facebook Login</strong> product is added to your app.
          </p>
        </div>
        
        {shouldShowOAuthButton() && !settings?.meta_access_token && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: `${tokens.accent}10`,
              border: `1px solid ${tokens.accent}30`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tokens.textPrimary,
                  margin: 0,
                  marginBottom: "4px",
                }}
              >
                Generate Access Token Automatically
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: tokens.textSecondary,
                  margin: 0,
                  marginBottom: "8px",
                }}
              >
                Click the button below to authenticate with Meta and automatically generate a long-lived access token (valid for 60 days).
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: tokens.textSecondary,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                Note: Make sure to add the redirect URI in Meta App Settings → Facebook Login → Settings:
                <br />
                <code style={{ fontSize: "11px", backgroundColor: tokens.bgBase, padding: "2px 4px", borderRadius: "4px" }}>
                  {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/settings?oauth=meta
                </code>
              </p>
            </div>
            <Button
              type="button"
              onClick={handleConnectWithMeta}
              disabled={isOAuthLoading}
              style={{
                fontSize: "14px",
                padding: "10px 20px",
                whiteSpace: "nowrap",
              }}
            >
              {getOAuthButtonText()}
            </Button>
          </div>
        )}

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  htmlFor="meta_access_token"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: tokens.textPrimary,
                  }}
                >
                  Meta Access Token
                  {settings?.meta_access_token && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        color: tokens.textSecondary,
                        fontWeight: 400,
                      }}
                    >
                      (Click "Reconnect" to generate a new token)
                    </span>
                  )}
                </label>
                {shouldShowOAuthButton() && (
                  <Button
                    type="button"
                    onClick={handleConnectWithMeta}
                    disabled={isOAuthLoading}
                    style={{
                      fontSize: "13px",
                      padding: "8px 16px",
                      minWidth: "auto",
                    }}
                  >
                    {getOAuthButtonText()}
                  </Button>
                )}
              </div>
              <textarea
                id="meta_access_token"
                name="meta_access_token"
                value={formData.meta_access_token || ""}
                onChange={handleChange}
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
                placeholder="Enter your Meta Access Token (optional) or click 'Connect with Meta' to generate automatically"
              />
              {settings?.token_expires_at && (
                <p
                  style={{
                    fontSize: "12px",
                    color: tokens.textSecondary,
                    marginTop: "8px",
                    marginBottom: 0,
                  }}
                >
                  Token expires: {new Date(settings.token_expires_at).toLocaleString()}
                </p>
              )}
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

      {/* WordPress Settings Section */}
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
          WordPress Settings
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: tokens.textSecondary,
            marginBottom: "16px",
          }}
        >
          Configure your WordPress credentials for automatic event posting. These credentials are encrypted and stored securely.
        </p>

        {isWpLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              color: tokens.textSecondary,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ animation: "spin 1s linear infinite", marginRight: "8px" }}
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
            Loading WordPress settings...
          </div>
        ) : (
          <>
            {wpError && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  backgroundColor: `${tokens.danger}15`,
                  border: `1px solid ${tokens.danger}40`,
                  borderRadius: "8px",
                  color: tokens.danger,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  />
                </svg>
                {wpError}
              </div>
            )}

            {wpSuccessMessage && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  backgroundColor: `${tokens.success}15`,
                  border: `1px solid ${tokens.success}40`,
                  borderRadius: "8px",
                  color: tokens.success,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L10 9.586l2.793-2.793a1 1 0 011.414 1.414z"
                  />
                </svg>
                {wpSuccessMessage}
              </div>
            )}

            <div
              style={{
                marginBottom: "24px",
                padding: "12px 16px",
                backgroundColor: tokens.bgBase,
                border: `1px solid ${tokens.border}`,
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              <p style={{ margin: 0, marginBottom: "8px", fontWeight: 500, color: tokens.textPrimary }}>
                📝 How to get your Application Password:
              </p>
              <ol style={{ margin: 0, paddingLeft: "20px", color: tokens.textSecondary }}>
                <li>Log in to your WordPress admin panel</li>
                <li>Go to <strong>Users → Profile</strong></li>
                <li>Scroll to <strong>"Application Passwords"</strong> section</li>
                <li>Enter a name (e.g., "AI Flyer") and click <strong>"Add New"</strong></li>
                <li>Copy the generated password and paste it below</li>
              </ol>
            </div>

            <form onSubmit={handleWpSave}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* WordPress Site URL - Read-only display */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                      marginBottom: "8px",
                    }}
                  >
                    WordPress Site
                  </label>
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: tokens.bgBase,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={tokens.accent}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <div>
                        <div style={{ fontSize: "14px", color: tokens.textPrimary, fontWeight: 500 }}>
                          {wpSettings?.wordpress_site_url || "https://dubevents.club"}
                        </div>
                        <div style={{ fontSize: "12px", color: tokens.textMuted }}>
                          Events will be posted to this WordPress site
                        </div>
                      </div>
                    </div>
                    <a
                      href={(wpSettings?.wordpress_site_url || "https://dubevents.club") + "/event-form/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        color: tokens.accent,
                        backgroundColor: `${tokens.accent}15`,
                        border: `1px solid ${tokens.accent}30`,
                        borderRadius: "6px",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${tokens.accent}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${tokens.accent}15`;
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      View Event Form
                    </a>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="wordpress_username"
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                      marginBottom: "8px",
                    }}
                  >
                    WordPress Username <span style={{ color: tokens.danger }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="wordpress_username"
                    name="wordpress_username"
                    value={wpFormData.wordpress_username || ""}
                    onChange={handleWpChange}
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
                    placeholder="Your WordPress admin username or email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wordpress_app_password"
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                      marginBottom: "8px",
                    }}
                  >
                    Application Password {!wpSettings && <span style={{ color: tokens.danger }}>*</span>}
                  </label>
                  {wpSettings && !wpFormData.wordpress_app_password && (
                    <div
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        color: tokens.textMuted,
                        backgroundColor: tokens.bgBase,
                        border: `1px solid ${tokens.border}`,
                        borderRadius: "8px",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ letterSpacing: "2px" }}>••••••••••••••••••••••••</span>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("wordpress_app_password") as HTMLInputElement;
                          if (input) input.focus();
                        }}
                        style={{
                          padding: "4px 10px",
                          fontSize: "12px",
                          color: tokens.accent,
                          backgroundColor: "transparent",
                          border: `1px solid ${tokens.accent}`,
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Change
                      </button>
                    </div>
                  )}
                  <input
                    type="password"
                    id="wordpress_app_password"
                    name="wordpress_app_password"
                    value={wpFormData.wordpress_app_password || ""}
                    onChange={handleWpChange}
                    required={!wpSettings}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      color: tokens.textPrimary,
                      backgroundColor: tokens.bgBase,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: "8px",
                      fontFamily: "inherit",
                      display: wpSettings && !wpFormData.wordpress_app_password ? "none" : "block",
                    }}
                    placeholder="e.g., xxxx xxxx xxxx xxxx xxxx xxxx"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="is_enabled"
                    name="is_enabled"
                    checked={wpFormData.is_enabled}
                    onChange={handleWpChange}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: tokens.accent,
                    }}
                  />
                  <label
                    htmlFor="is_enabled"
                    style={{
                      fontSize: "14px",
                      color: tokens.textPrimary,
                      cursor: "pointer",
                    }}
                  >
                    Enable WordPress posting
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: `1px solid ${tokens.border}`,
                }}
              >
                <Button
                  type="button"
                  onClick={handleTestWpConnection}
                  disabled={isWpTesting || !wpFormData.wordpress_username || !wpFormData.wordpress_app_password}
                  variant="secondary"
                  style={{
                    minWidth: "140px",
                  }}
                >
                  {isWpTesting ? "Testing..." : "Test Connection"}
                </Button>
                <Button
                  type="submit"
                  disabled={isWpSaving}
                  style={{
                    minWidth: "120px",
                  }}
                >
                  {isWpSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

