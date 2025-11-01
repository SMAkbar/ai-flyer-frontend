"use client";

import { Card } from "@/components/ui/Card";
import { AvatarPreview } from "./AvatarPreview";
import type { UserProfileRead } from "@/lib/api/user";
import { tokens } from "@/components/theme/tokens";

type ProfileViewProps = {
  user: UserProfileRead;
};

function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: tokens.textMuted,
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "15px",
          color: tokens.textPrimary,
          lineHeight: "1.5",
          fontWeight: 400,
        }}
      >
        {value}
      </div>
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
        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
          <AvatarPreview avatarUrl={user.avatar_url} name={displayName} size={140} />
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
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {user.email}
            </div>
            {user.bio && (
              <p
                style={{
                  fontSize: "15px",
                  color: tokens.textSecondary,
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  marginTop: "12px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${tokens.border}`,
                }}
              >
                {user.bio}
              </p>
            )}
          </div>
        </div>
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Personal Details
          </h2>
          <FieldRow label="First Name" value={user.first_name} />
          <FieldRow label="Last Name" value={user.last_name} />
          <FieldRow label="Full Name" value={user.full_name} />
          <FieldRow label="Phone Number" value={user.phone_number} />
          <FieldRow
            label="Date of Birth"
            value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null}
          />
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Location
          </h2>
          <FieldRow label="City" value={user.city} />
          <FieldRow label="Country" value={user.country} />
          <FieldRow label="Timezone" value={user.timezone} />
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
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Professional
          </h2>
          <FieldRow label="Company" value={user.company} />
          <FieldRow label="Job Title" value={user.job_title} />
          {user.website_url && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: tokens.textMuted,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Website
              </div>
              <a
                href={user.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "15px",
                  color: tokens.accent,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = tokens.accentHover;
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = tokens.accent;
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                {user.website_url}
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
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          )}
        </Card>

        {/* Account Information */}
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Account Details
          </h2>
          <FieldRow label="Account Created" value={formatDate(user.created_at)} />
          <FieldRow label="Last Updated" value={formatDate(user.updated_at)} />
          <FieldRow label="Last Login" value={formatDate(user.last_login)} />
        </Card>
      </div>
    </div>
  );
}

