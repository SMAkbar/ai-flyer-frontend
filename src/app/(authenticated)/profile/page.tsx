"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userApi, type UserProfileRead, type UserUpdate } from "@/lib/api/user";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfileRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    setError(null);
    const res = await userApi.getProfile();
    setIsLoading(false);

    if (!res.ok) {
      setError(res.error.message || "Failed to load profile");
      return;
    }

    setUser(res.data);
  }

  async function handleSave(data: UserUpdate) {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const res = await userApi.updateProfile(data);
    setIsSaving(false);

    if (!res.ok) {
      setError(res.error.message || "Failed to update profile");
      return;
    }

    setUser(res.data);
    setIsEditing(false);
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  function handleCancel() {
    setIsEditing(false);
    setError(null);
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
          Loading profile...
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

  if (error && !user) {
    return (
      <div
        style={{
          width: "90%",
          margin: "0 auto",
          maxWidth: "1600px",
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
        <Button onClick={loadProfile}>Retry</Button>
      </div>
    );
  }

  if (!user) {
    return null;
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: tokens.textPrimary,
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Profile
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: tokens.textSecondary,
              margin: 0,
            }}
          >
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
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

      {isEditing ? (
        <ProfileForm
          user={user}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      ) : (
        <ProfileView user={user} />
      )}
    </div>
  );
}

