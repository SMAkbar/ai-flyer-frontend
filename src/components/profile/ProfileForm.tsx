"use client";

import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AvatarPreview } from "./AvatarPreview";
import type { UserProfileRead, UserUpdate } from "@/lib/api/user";

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
            <AvatarPreview avatarUrl={formData.avatar_url || null} name={displayName} size={120} />
            <div className="mt-4">
              <label className="block text-xs opacity-70 mb-1">Avatar URL</label>
              <Input
                type="url"
                value={formData.avatar_url || ""}
                onChange={(e) => updateField("avatar_url", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatar_url && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.avatar_url}</div>
              )}
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Email</label>
              <Input type="email" value={user.email} disabled />
              <div className="text-xs opacity-50 mt-1">Email cannot be changed</div>
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">First Name</label>
              <Input
                value={formData.first_name || ""}
                onChange={(e) => updateField("first_name", e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Last Name</label>
              <Input
                value={formData.last_name || ""}
                onChange={(e) => updateField("last_name", e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Full Name</label>
              <Input
                value={formData.full_name || ""}
                onChange={(e) => updateField("full_name", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone_number || ""}
                onChange={(e) => updateField("phone_number", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Date of Birth</label>
              <Input
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Bio</label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
                style={{
                  width: "100%",
                  backgroundColor: "#1F1F1F",
                  color: "#E6E6E6",
                  border: "1px solid #2A2A2A",
                  borderRadius: 8,
                  padding: "10px 12px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </Card>

        {/* Location Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">City</label>
              <Input
                value={formData.city || ""}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Country</label>
              <Input
                value={formData.country || ""}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Country"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Timezone</label>
              <Input
                value={formData.timezone || ""}
                onChange={(e) => updateField("timezone", e.target.value)}
                placeholder="America/New_York"
              />
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Professional</h2>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Company</label>
              <Input
                value={formData.company || ""}
                onChange={(e) => updateField("company", e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Job Title</label>
              <Input
                value={formData.job_title || ""}
                onChange={(e) => updateField("job_title", e.target.value)}
                placeholder="Job title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs opacity-70 mb-1">Website URL</label>
              <Input
                type="url"
                value={formData.website_url || ""}
                onChange={(e) => updateField("website_url", e.target.value)}
                placeholder="https://example.com"
              />
              {errors.website_url && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.website_url}</div>
              )}
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

