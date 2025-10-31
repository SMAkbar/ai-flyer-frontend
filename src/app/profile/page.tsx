"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userApi, type UserProfileRead, type UserUpdate } from "@/lib/api/user";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Button } from "@/components/ui/Button";

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
      if (res.error.status === 401) {
        router.push("/login");
        return;
      }
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
      if (res.error.status === 401) {
        router.push("/login");
        return;
      }
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Loading profile...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={loadProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200">
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

