"use client";

import { Card } from "@/components/ui/Card";
import { AvatarPreview } from "./AvatarPreview";
import type { UserProfileRead } from "@/lib/api/user";

type ProfileViewProps = {
  user: UserProfileRead;
};

function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <div className="text-xs opacity-70 mb-1">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function formatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

export function ProfileView({ user }: ProfileViewProps) {
  const displayName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
          <AvatarPreview avatarUrl={user.avatar_url} name={displayName} size={120} />
          {user.avatar_url && (
            <div className="mt-4 text-xs opacity-70 break-all">{user.avatar_url}</div>
          )}
        </div>
      </Card>

      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <FieldRow label="Email" value={user.email} />
          <FieldRow label="First Name" value={user.first_name} />
          <FieldRow label="Last Name" value={user.last_name} />
          <FieldRow label="Full Name" value={user.full_name} />
          <FieldRow label="Phone Number" value={user.phone_number} />
          <FieldRow
            label="Date of Birth"
            value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null}
          />
          {user.bio && (
            <div className="mb-4">
              <div className="text-xs opacity-70 mb-1">Bio</div>
              <div className="text-sm whitespace-pre-wrap">{user.bio}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Location Information */}
      {(user.city || user.country || user.timezone) && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <FieldRow label="City" value={user.city} />
            <FieldRow label="Country" value={user.country} />
            <FieldRow label="Timezone" value={user.timezone} />
          </div>
        </Card>
      )}

      {/* Professional Information */}
      {(user.company || user.job_title || user.website_url) && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Professional</h2>
            <FieldRow label="Company" value={user.company} />
            <FieldRow label="Job Title" value={user.job_title} />
            {user.website_url && (
              <div className="mb-4">
                <div className="text-xs opacity-70 mb-1">Website</div>
                <a
                  href={user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {user.website_url}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <FieldRow label="Account Created" value={formatDate(user.created_at)} />
          <FieldRow label="Last Updated" value={formatDate(user.updated_at)} />
          <FieldRow label="Last Login" value={formatDate(user.last_login)} />
        </div>
      </Card>
    </div>
  );
}

