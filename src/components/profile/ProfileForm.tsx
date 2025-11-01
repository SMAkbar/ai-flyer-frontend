"use client";

import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AvatarPreview } from "./AvatarPreview";
import type { UserProfileRead, UserUpdate } from "@/lib/api/user";
import { tokens } from "@/components/theme/tokens";
import { MailIcon, MapPinIcon, BriefcaseIcon, ProfileIcon } from "@/components/icons";

type ProfileFormProps = {
  user: UserProfileRead;
  onSave: (data: UserUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ProfileForm({ user, onSave, onCancel, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState<UserUpdate>({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    full_name: user.full_name || "",
    phone_number: user.phone_number || "",
    date_of_birth: user.date_of_birth || "",
    bio: user.bio || "",
    avatar_url: user.avatar_url || "",
    city: user.city || "",
    country: user.country || "",
    timezone: user.timezone || "",
    company: user.company || "",
    job_title: user.job_title || "",
    website_url: user.website_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateUrl(url: string): boolean {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.avatar_url && !validateUrl(formData.avatar_url)) {
      newErrors.avatar_url = "Invalid URL";
    }
    if (formData.website_url && !validateUrl(formData.website_url)) {
      newErrors.website_url = "Invalid URL";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Convert empty strings to null
    const cleanedData: UserUpdate = {};
    for (const [key, value] of Object.entries(formData)) {
      cleanedData[key as keyof UserUpdate] = value === "" ? null : value;
    }
    await onSave(cleanedData);
  }

  function updateField<K extends keyof UserUpdate>(field: K, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const displayName = formData.full_name || `${formData.first_name || ""} ${formData.last_name || ""}`.trim() || user.email;

  function FormField({
    label,
    children,
    error,
    hint,
  }: {
    label: string;
    children: React.ReactNode;
    error?: string;
    hint?: string;
  }) {
    return (
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
        {children}
        {error && (
          <div
            style={{
              fontSize: "13px",
              color: tokens.danger,
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12.25A5.25 5.25 0 117 1.75 5.25 5.25 0 017 12.25zm-.88-3.5h1.75V9.62H6.12v-.87zm0-2.63h1.75V4.38H6.12v1.62z"
                fill="currentColor"
              />
            </svg>
            {error}
          </div>
        )}
        {hint && !error && (
          <div
            style={{
              fontSize: "12px",
              color: tokens.textMuted,
              marginTop: "6px",
            }}
          >
            {hint}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Profile Header - Full Width Hero Section */}
        <Card
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "20px",
            padding: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap", marginBottom: "24px" }}>
            <AvatarPreview avatarUrl={formData.avatar_url || null} name={displayName} size={140} />
            <div style={{ flex: 1, minWidth: "280px" }}>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: tokens.textPrimary,
                  marginBottom: "8px",
                  letterSpacing: "-0.02em",
                }}
              >
                {displayName}
              </h1>
              <div
                style={{
                  fontSize: "16px",
                  color: tokens.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                  <MailIcon size={18} color="currentColor" />
                  {user.email}
              </div>
            </div>
          </div>
          <FormField label="Avatar URL" error={errors.avatar_url}>
            <Input
              type="url"
              value={formData.avatar_url || ""}
              onChange={(e) => updateField("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={isLoading}
            />
          </FormField>
        </Card>

        {/* Two Column Grid for Information Sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
            gap: "24px",
          }}
        >
          {/* Basic Information */}
          <Card
            style={{
              backgroundColor: tokens.bgElevated,
              border: `1px solid ${tokens.border}`,
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: tokens.textPrimary,
                marginBottom: "20px",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <ProfileIcon size={18} color="currentColor" />
              Personal Details
            </h2>
          <FormField label="Email" hint="Email cannot be changed">
            <Input type="email" value={user.email} disabled />
          </FormField>
          <FormField label="First Name">
            <Input
              value={formData.first_name || ""}
              onChange={(e) => updateField("first_name", e.target.value)}
              placeholder="First name"
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Last Name">
            <Input
              value={formData.last_name || ""}
              onChange={(e) => updateField("last_name", e.target.value)}
              placeholder="Last name"
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Full Name">
            <Input
              value={formData.full_name || ""}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Full name"
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Phone Number">
            <Input
              type="tel"
              value={formData.phone_number || ""}
              onChange={(e) => updateField("phone_number", e.target.value)}
              placeholder="+1 234 567 8900"
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Date of Birth">
            <Input
              type="date"
              value={formData.date_of_birth || ""}
              onChange={(e) => updateField("date_of_birth", e.target.value)}
              disabled={isLoading}
            />
          </FormField>
          </Card>

          {/* Location Information */}
          <Card
            style={{
              backgroundColor: tokens.bgElevated,
              border: `1px solid ${tokens.border}`,
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: tokens.textPrimary,
                marginBottom: "20px",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MapPinIcon size={18} color="currentColor" />
              Location
            </h2>
          <FormField label="City">
            <Input
              value={formData.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Country">
            <Input
              value={formData.country || ""}
              onChange={(e) => updateField("country", e.target.value)}
              placeholder="Country"
              disabled={isLoading}
            />
          </FormField>
            <FormField label="Timezone">
              <Input
                value={formData.timezone || ""}
                onChange={(e) => updateField("timezone", e.target.value)}
                placeholder="America/New_York"
                disabled={isLoading}
              />
            </FormField>
          </Card>

          {/* Professional Information */}
          <Card
            style={{
              backgroundColor: tokens.bgElevated,
              border: `1px solid ${tokens.border}`,
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: tokens.textPrimary,
                marginBottom: "20px",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <BriefcaseIcon size={18} color="currentColor" />
              Professional
            </h2>
          <FormField label="Company">
            <Input
              value={formData.company || ""}
              onChange={(e) => updateField("company", e.target.value)}
              placeholder="Company name"
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Job Title">
            <Input
              value={formData.job_title || ""}
              onChange={(e) => updateField("job_title", e.target.value)}
              placeholder="Job title"
              disabled={isLoading}
            />
          </FormField>
            <FormField label="Website URL" error={errors.website_url}>
              <Input
                type="url"
                value={formData.website_url || ""}
                onChange={(e) => updateField("website_url", e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </FormField>
          </Card>

          {/* Bio Section - Full Width */}
          <Card
            style={{
              backgroundColor: tokens.bgElevated,
              border: `1px solid ${tokens.border}`,
              borderRadius: "16px",
              padding: "28px",
              gridColumn: "1 / -1",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: tokens.textPrimary,
                marginBottom: "20px",
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: "10px",
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Bio
            </h2>
            <FormField label="About">
              <Textarea
                value={formData.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
                disabled={isLoading}
              />
            </FormField>
          </Card>
        </div>

        {/* Form Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            paddingTop: "8px",
          }}
        >
          <Button type="submit" disabled={isLoading} style={{ minWidth: "140px" }}>
            {isLoading ? (
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
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            style={{ minWidth: "120px" }}
          >
            Cancel
          </Button>
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
    </form>
  );
}

