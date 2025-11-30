# Frontend Instagram Posting Scheduler

Title: Frontend Instagram Posting Scheduler
Owners: Frontend team
Date: 2025-01-30
Slug: frontend-instagram-posting-scheduler

## Summary and background

Users need a dedicated page to select generated promotional images and schedule them for posting on Instagram. The page should display images grouped by category (TIME_DATE, PERFORMERS, LOCATION), allow selecting one image per category, and provide options to post immediately or schedule for later.

**Key Features:**
1. **Separate Scheduling Page**: New route for Instagram posting management
2. **Category-based Display**: Images organized by type (TIME_DATE, PERFORMERS, LOCATION)
3. **Single Selection per Category**: Users can select exactly one image from each category
4. **Post Options**: Post immediately or schedule for later
5. **Caption & Hashtag Editing**: Edit auto-generated captions and add hashtags
6. **Status Visualization**: Show scheduled/posting/posted status for each selected image
7. **Navigation**: Link from flyer detail page to scheduling page

This feature builds on:
- Generated images display (`GeneratedImagesSection`, `GeneratedImageCard`)
- Existing API client patterns (`apiClient`, `flyersApi`)
- Component patterns (`PageLayout`, `Card`, `Button`, `Input`)
- Type definitions (`FlyerGeneratedImage`, `GeneratedImageType`)

## Goals and non-goals

### Goals
- Create dedicated Instagram posting page (`/flyers/{id}/instagram`)
- Display images grouped by category (TIME_DATE, PERFORMERS, LOCATION)
- Allow selecting exactly one image per category
- Provide "Post Now" and "Schedule Later" options
- Support caption and hashtag editing
- Show posting status (pending, scheduled, posting, posted, failed)
- Visual feedback for selected images
- Date/time picker for scheduling
- Link from flyer detail page to scheduling page
- Display scheduled posts with status and timestamps
- Allow canceling scheduled posts (before posting)

### Non-goals
- Editing posts after they're published (read-only after posting)
- Multi-image carousel posts (single image per post)
- Post analytics/metrics (can be added later)
- Instagram account connection UI (assumes backend handles OAuth)
- Bulk scheduling operations (one at a time for MVP)
- Post preview before scheduling (can be enhanced later)

## Scope and assumptions

### Scope
- Frontend-only changes:
  - New page route `/flyers/{id}/instagram`
  - New components for image selection and scheduling
  - API integration for Instagram posting endpoints
  - Date/time picker for scheduling
  - Status badges and visual feedback
  - Navigation link from flyer detail page
  - Type definitions for Instagram posting schemas

### Assumptions
- Backend API endpoints are available (see backend feature doc)
- Instagram account is already connected (handled by backend)
- Images are already generated and available
- Date/time picker can use native HTML5 `<input type="datetime-local">` or a library
- User has at least one image per category (or UI handles empty states)
- Browser supports modern date/time input types
- API returns updated status immediately after scheduling

## UI/UX Design

### Page Layout

**Route:** `/flyers/{id}/instagram`

**Page Structure:**
```
┌─────────────────────────────────────────────────┐
│ Back Button ←                                   │
│                                                 │
│ Flyer Title: "Event Name"                       │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Image Category: Time/Date                  │  │
│ │ ┌──────┐ ┌──────┐ ┌──────┐              │  │
│ │ │ Image│ │ Image│ │ Image│              │  │
│ │ │  ✓   │ │      │ │      │              │  │
│ │ └──────┘ └──────┘ └──────┘              │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Image Category: Performers                 │  │
│ │ ┌──────┐ ┌──────┐                        │  │
│ │ │ Image│ │ Image│                        │  │
│ │ │      │ │  ✓   │                        │  │
│ │ └──────┘ └──────┘                        │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Image Category: Location                  │  │
│ │ ┌──────┐                                  │  │
│ │ │ Image│                                  │  │
│ │ │  ✓   │                                  │  │
│ │ └──────┘                                  │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Posting Options                            │  │
│ │                                             │  │
│ │ Caption: [Editable text area]             │  │
│ │ Hashtags: [Editable input]               │  │
│ │                                             │  │
│ │ ○ Post Now                                 │  │
│ │ ● Schedule for Later                       │  │
│ │   [Date/Time Picker]                       │  │
│ │                                             │  │
│ │ [Schedule Posts] Button                     │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Scheduled Posts                            │  │
│ │ ┌─────────────────────────────────────┐   │  │
│ │ │ Time/Date Image                     │   │  │
│ │ │ Scheduled: Jan 30, 2025 3:00 PM     │   │  │
│ │ │ Status: Scheduled                   │   │  │
│ │ │ [Cancel]                            │   │  │
│ │ └─────────────────────────────────────┘   │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Component Structure

```
app/(authenticated)/flyers/[id]/instagram/
  └── page.tsx                    # Main Instagram scheduling page

components/flyers/
  ├── InstagramSchedulingPage.tsx # Main page component
  ├── ImageCategorySection.tsx    # Category section with image selection
  ├── ImageSelectionCard.tsx      # Selectable image card (radio button)
  ├── PostingOptionsCard.tsx     # Caption, hashtags, post/schedule options
  ├── ScheduledPostsCard.tsx     # List of scheduled posts with status
  └── PostStatusBadge.tsx        # Status badge component

lib/api/
  └── instagram.ts               # Instagram posting API client
```

### Visual States

**Image Selection:**
- Unselected: Normal border, no indicator
- Selected: Highlighted border (accent color), checkmark icon overlay
- Disabled: Reduced opacity, disabled interaction

**Post Status:**
- Pending: Gray badge "Pending"
- Scheduled: Blue badge "Scheduled" with timestamp
- Posting: Yellow badge "Posting..." with spinner
- Posted: Green badge "Posted" with timestamp and Instagram icon
- Failed: Red badge "Failed" with error message

**Form Validation:**
- At least one image selected from each available category
- Caption length ≤ 2,200 characters (show character count)
- ~~Scheduled time must be in the future~~ (removed: users can select any time, backend handles past/present times by posting immediately)
- Show inline error messages

## API Integration

### New API Client

**File:** `frontend/src/lib/api/instagram.ts`

```typescript
import { apiClient } from "./client";
import type { FlyerGeneratedImage } from "./flyers";

export type PostStatus = "pending" | "scheduled" | "posting" | "posted" | "failed";

export type InstagramPostRead = {
  id: number;
  flyer_generated_image_id: number;
  post_status: PostStatus;
  instagram_post_id: string | null;
  post_error: string | null;
  caption: string | null;
  hashtags: string | null;
  is_selected_for_posting: boolean;
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduledPostRead = InstagramPostRead;

export type SelectImagesRequest = {
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
};

export type SelectImagesResponse = {
  flyer_id: number;
  selected_posts: InstagramPostRead[];
};

export type SchedulePostRequest = {
  image_id: number;
  scheduled_at: string; // ISO 8601 datetime
  caption: string | null;
  hashtags: string | null;
};

export type SchedulePostResponse = ScheduledPostRead;

export type ScheduledPostsResponse = {
  flyer_id: number;
  scheduled_posts: ScheduledPostRead[];
};

export const instagramApi = {
  selectImages: (flyerId: number, data: SelectImagesRequest) =>
    apiClient.post<SelectImagesResponse>(`/flyers/${flyerId}/instagram/select-images`, data),

  schedulePost: (flyerId: number, data: SchedulePostRequest) =>
    apiClient.post<SchedulePostResponse>(`/flyers/${flyerId}/instagram/schedule`, data),

  getScheduledPosts: (flyerId: number) =>
    apiClient.get<ScheduledPostsResponse>(`/flyers/${flyerId}/instagram/scheduled`),

  cancelScheduledPost: (flyerId: number, imageId: number) =>
    apiClient.del(`/flyers/${flyerId}/instagram/scheduled/${imageId}`),

  getConnectionStatus: () =>
    apiClient.get<{
      connected: boolean;
      instagram_account_id: string | null;
      instagram_username: string | null;
      facebook_page_id: string | null;
      connected_at: string | null;
    }>("/instagram/status"),
};
```

### Update Flyers API Types

**File:** `frontend/src/lib/api/flyers.ts`

```typescript
// Add to existing FlyerGeneratedImage type:
export type FlyerGeneratedImage = {
  id: number;
  flyer_id: number;
  image_type: GeneratedImageType;
  cloudfront_url: string;
  instagram_post_content: string | null;
  instagram_post_status?: PostStatus; // NEW
  instagram_post_id?: string | null; // NEW
  instagram_post_error?: string | null; // NEW
  instagram_post_caption?: string | null; // NEW
  instagram_post_hashtags?: string | null; // NEW
  is_selected_for_posting?: boolean; // NEW
  instagram_posted_at: string | null;
  instagram_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};
```

## Implementation details

### Main Page Component

**File:** `frontend/src/app/(authenticated)/flyers/[id]/instagram/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { Container } from "@/components/ui/Container";
import { BackButton } from "@/components/ui/BackButton";
import { InstagramSchedulingPage } from "@/components/flyers/InstagramSchedulingPage";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";

export default function InstagramPostingPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params?.id ? parseInt(params.id as string, 10) : null;

  const [flyer, setFlyer] = useState<FlyerDetailRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flyerId) {
      loadFlyer();
    }
  }, [flyerId]);

  async function loadFlyer() {
    if (!flyerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await flyersApi.getById(flyerId);

      if (result.ok) {
        setFlyer(result.data);
      } else {
        setError(result.error.message || "Failed to load flyer");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageLayout
      isLoading={isLoading}
      loadingMessage="Loading flyer..."
      error={error || (!flyer ? "Flyer not found" : null)}
      onRetry={loadFlyer}
    >
      <Container>
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>

        {flyer && (
          <InstagramSchedulingPage
            flyer={flyer}
            onBack={() => router.push(`/flyers/${flyer.id}`)}
          />
        )}
      </Container>
    </PageLayout>
  );
}
```

### Image Category Section Component

**File:** `frontend/src/components/flyers/ImageCategorySection.tsx`

```typescript
"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import { ImageSelectionCard } from "./ImageSelectionCard";
import type { FlyerGeneratedImage, GeneratedImageType } from "@/lib/api/flyers";

type ImageCategorySectionProps = {
  categoryType: GeneratedImageType;
  categoryLabel: string;
  images: FlyerGeneratedImage[];
  selectedImageId: number | null;
  onSelectImage: (imageId: number) => void;
  disabled?: boolean;
};

export function ImageCategorySection({
  categoryType,
  categoryLabel,
  images,
  selectedImageId,
  onSelectImage,
  disabled = false,
}: ImageCategorySectionProps) {
  const categoryImages = images.filter((img) => img.image_type === categoryType);

  if (categoryImages.length === 0) {
    return null; // Don't render section if no images
  }

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: "16px",
          letterSpacing: "-0.01em",
        }}
      >
        {categoryLabel}
      </h2>
      <p
        style={{
          fontSize: "14px",
          color: tokens.textSecondary,
          marginBottom: "20px",
        }}
      >
        Select one image from this category to post on Instagram
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
          gap: "16px",
        }}
      >
        {categoryImages.map((image) => (
          <ImageSelectionCard
            key={image.id}
            image={image}
            isSelected={selectedImageId === image.id}
            onSelect={() => !disabled && onSelectImage(image.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </Card>
  );
}
```

### Image Selection Card Component

**File:** `frontend/src/components/flyers/ImageSelectionCard.tsx`

```typescript
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import { ImageIcon, CheckIcon } from "@/components/icons";
import type { FlyerGeneratedImage } from "@/lib/api/flyers";

type ImageSelectionCardProps = {
  image: FlyerGeneratedImage;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export function ImageSelectionCard({
  image,
  isSelected,
  onSelect,
  disabled = false,
}: ImageSelectionCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      onClick={disabled ? undefined : onSelect}
      style={{
        backgroundColor: tokens.bgElevated,
        border: `2px solid ${isSelected ? tokens.accent : tokens.border}`,
        borderRadius: "12px",
        padding: 0,
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      {/* Image Preview */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1/1",
          overflow: "hidden",
          backgroundColor: tokens.bgHover,
        }}
      >
        {!imageError ? (
          <img
            src={image.cloudfront_url}
            alt={`Generated ${image.image_type} image`}
            onError={() => setImageError(true)}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: tokens.bgHover,
            }}
          >
            <ImageIcon size={32} color={tokens.textMuted} strokeWidth="1.5" />
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: tokens.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${tokens.bgBase}`,
            }}
          >
            <CheckIcon size={14} color={tokens.textPrimary} strokeWidth="3" />
          </div>
        )}
      </div>
    </Card>
  );
}
```

### Posting Options Card Component

**File:** `frontend/src/components/flyers/PostingOptionsCard.tsx`

```typescript
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { tokens } from "@/components/theme/tokens";

type PostingMode = "now" | "schedule";

type PostingOptionsCardProps = {
  caption: string;
  hashtags: string;
  scheduledAt: string; // ISO datetime string
  onCaptionChange: (caption: string) => void;
  onHashtagsChange: (hashtags: string) => void;
  onScheduledAtChange: (scheduledAt: string) => void;
  onPostingModeChange: (mode: PostingMode) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
};

export function PostingOptionsCard({
  caption,
  hashtags,
  scheduledAt,
  onCaptionChange,
  onHashtagsChange,
  onScheduledAtChange,
  onPostingModeChange,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: PostingOptionsCardProps) {
  const [postingMode, setPostingMode] = useState<PostingMode>("now");

  const handleModeChange = (mode: PostingMode) => {
    setPostingMode(mode);
    onPostingModeChange(mode);
  };

  // Convert ISO datetime to datetime-local format
  const datetimeLocalValue = scheduledAt
    ? new Date(scheduledAt).toISOString().slice(0, 16)
    : "";

  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const date = new Date(value);
      onScheduledAtChange(date.toISOString());
    }
  };

  const captionLength = caption.length;
  const maxCaptionLength = 2200;

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Posting Options
      </h2>

      {/* Caption */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          Caption
        </label>
        <Textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Enter post caption (auto-generated from event data)"
          disabled={disabled || isSubmitting}
          rows={4}
          style={{
            marginBottom: "4px",
          }}
        />
        <div
          style={{
            fontSize: "12px",
            color:
              captionLength > maxCaptionLength
                ? tokens.error
                : tokens.textMuted,
            textAlign: "right",
          }}
        >
          {captionLength} / {maxCaptionLength} characters
        </div>
      </div>

      {/* Hashtags */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          Hashtags (optional)
        </label>
        <Input
          type="text"
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="#hashtag1 #hashtag2 #hashtag3"
          disabled={disabled || isSubmitting}
        />
      </div>

      {/* Posting Mode */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "12px",
          }}
        >
          When to Post
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              opacity: disabled || isSubmitting ? 0.6 : 1,
            }}
          >
            <input
              type="radio"
              name="postingMode"
              value="now"
              checked={postingMode === "now"}
              onChange={() => handleModeChange("now")}
              disabled={disabled || isSubmitting}
              style={{
                width: "18px",
                height: "18px",
                cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                color: tokens.textPrimary,
                fontWeight: 500,
              }}
            >
              Post Now
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              opacity: disabled || isSubmitting ? 0.6 : 1,
            }}
          >
            <input
              type="radio"
              name="postingMode"
              value="schedule"
              checked={postingMode === "schedule"}
              onChange={() => handleModeChange("schedule")}
              disabled={disabled || isSubmitting}
              style={{
                width: "18px",
                height: "18px",
                cursor: disabled || isSubmitting ? "not-allowed" : "pointer",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                color: tokens.textPrimary,
                fontWeight: 500,
              }}
            >
              Schedule for Later
            </span>
          </label>
        </div>

        {/* Date/Time Picker */}
        {postingMode === "schedule" && (
          <div style={{ marginTop: "16px", marginLeft: "28px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: tokens.textPrimary,
                marginBottom: "8px",
              }}
            >
              Scheduled Date & Time
            </label>
            <Input
              type="datetime-local"
              value={datetimeLocalValue}
              onChange={handleDatetimeChange}
              disabled={disabled || isSubmitting}
              min={new Date().toISOString().slice(0, 16)} // Prevent past dates
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={disabled || isSubmitting || captionLength > maxCaptionLength}
        style={{
          width: "100%",
        }}
      >
        {isSubmitting
          ? "Scheduling..."
          : postingMode === "now"
          ? "Post Now"
          : "Schedule Posts"}
      </Button>
    </Card>
  );
}
```

### Scheduled Posts Card Component

**File:** `frontend/src/components/flyers/ScheduledPostsCard.tsx`

```typescript
"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";
import { PostStatusBadge } from "./PostStatusBadge";
import type { ScheduledPostRead } from "@/lib/api/instagram";

type ScheduledPostsCardProps = {
  posts: ScheduledPostRead[];
  onCancelPost: (imageId: number) => void;
  isCanceling?: number | null;
};

export function ScheduledPostsCard({
  posts,
  onCancelPost,
  isCanceling = null,
}: ScheduledPostsCardProps) {
  if (posts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageTypeLabel = (type: string): string => {
    switch (type) {
      case "time_date":
        return "Time/Date";
      case "performers":
        return "Performers";
      case "location":
        return "Location";
      default:
        return type;
    }
  };

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          marginBottom: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        Scheduled Posts
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              backgroundColor: tokens.bgHover,
              borderRadius: "12px",
              border: `1px solid ${tokens.border}`,
            }}
          >
            {/* Image Preview */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: tokens.bgElevated,
                flexShrink: 0,
              }}
            >
              <img
                src={post.cloudfront_url}
                alt={getImageTypeLabel(post.image_type)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Post Info */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: tokens.textPrimary,
                  }}
                >
                  {getImageTypeLabel(post.image_type)}
                </h3>
                <PostStatusBadge status={post.post_status} />
              </div>

              {post.scheduled_at && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: tokens.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Scheduled: {formatDate(post.scheduled_at)}
                </p>
              )}

              {post.posted_at && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: tokens.textSecondary,
                  }}
                >
                  Posted: {formatDate(post.posted_at)}
                </p>
              )}

              {post.post_error && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: tokens.error,
                    marginTop: "4px",
                  }}
                >
                  Error: {post.post_error}
                </p>
              )}
            </div>

            {/* Cancel Button */}
            {post.post_status === "scheduled" &&
              !post.posted_at && (
                <Button
                  variant="secondary"
                  onClick={() => onCancelPost(post.flyer_generated_image_id)}
                  disabled={isCanceling === post.flyer_generated_image_id}
                  style={{
                    flexShrink: 0,
                  }}
                >
                  {isCanceling === post.flyer_generated_image_id ? "Canceling..." : "Cancel"}
                </Button>
              )}
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### Post Status Badge Component

**File:** `frontend/src/components/flyers/PostStatusBadge.tsx`

```typescript
"use client";

import React from "react";
import { tokens } from "@/components/theme/tokens";
import type { PostStatus } from "@/lib/api/instagram";

type PostStatusBadgeProps = {
  status: PostStatus;
};

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: tokens.textMuted,
          bgColor: tokens.bgHover,
        };
      case "scheduled":
        return {
          label: "Scheduled",
          color: tokens.accent,
          bgColor: `${tokens.accent}20`,
        };
      case "posting":
        return {
          label: "Posting...",
          color: tokens.warning || "#f59e0b",
          bgColor: "#f59e0b20",
        };
      case "posted":
        return {
          label: "Posted",
          color: tokens.success || "#10b981",
          bgColor: "#10b98120",
        };
      case "failed":
        return {
          label: "Failed",
          color: tokens.error,
          bgColor: `${tokens.error}20`,
        };
      default:
        return {
          label: status,
          color: tokens.textMuted,
          bgColor: tokens.bgHover,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "12px",
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bgColor,
        padding: "4px 10px",
        borderRadius: "6px",
        letterSpacing: "0.01em",
      }}
    >
      {config.label}
    </span>
  );
}
```

### Main Instagram Scheduling Page Component

**File:** `frontend/src/components/flyers/InstagramSchedulingPage.tsx`

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { ImageCategorySection } from "./ImageCategorySection";
import { PostingOptionsCard } from "./PostingOptionsCard";
import { ScheduledPostsCard } from "./ScheduledPostsCard";
import { instagramApi, type ScheduledPostRead } from "@/lib/api/instagram";
import { flyersApi, type FlyerDetailRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import type { GeneratedImageType } from "@/lib/api/flyers";

type InstagramSchedulingPageProps = {
  flyer: FlyerDetailRead;
  onBack: () => void;
};

export function InstagramSchedulingPage({
  flyer,
  onBack,
}: InstagramSchedulingPageProps) {
  const router = useRouter();

  // State for selected images (one per category)
  const [selectedTimeDateImageId, setSelectedTimeDateImageId] = useState<number | null>(null);
  const [selectedPerformersImageId, setSelectedPerformersImageId] = useState<number | null>(null);
  const [selectedLocationImageId, setSelectedLocationImageId] = useState<number | null>(null);

  // State for posting options
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>(
    new Date().toISOString()
  );
  const [postingMode, setPostingMode] = useState<"now" | "schedule">("now");

  // State for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostRead[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load scheduled posts on mount
  useEffect(() => {
    loadScheduledPosts();
    generateDefaultCaption();
  }, [flyer]);

  // Auto-generate caption from extraction data
  function generateDefaultCaption() {
    if (!flyer.information_extraction) return;

    const extraction = flyer.information_extraction;
    const parts: string[] = [];

    if (extraction.event_title) {
      parts.push(extraction.event_title);
    }

    if (extraction.event_date_time) {
      parts.push(`📅 ${extraction.event_date_time}`);
    }

    if (extraction.location_town_city) {
      parts.push(`📍 ${extraction.location_town_city}`);
    }

    if (extraction.performers_djs_soundsystems) {
      parts.push(`🎵 ${extraction.performers_djs_soundsystems}`);
    }

    setCaption(parts.join("\n\n"));
  }

  async function loadScheduledPosts() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.getScheduledPosts(flyer.id);

      if (result.ok) {
        setScheduledPosts(result.data.scheduled_posts);

        // Pre-select images that are already scheduled
        // Note: Need to fetch image details to get image_type
        // For now, we'll rely on the flyer's generated_images to match
        // This will be handled by matching flyer_generated_image_id
      } else {
        setError(result.error.message || "Failed to load scheduled posts");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectImage(category: GeneratedImageType, imageId: number) {
    switch (category) {
      case "time_date":
        setSelectedTimeDateImageId(imageId);
        break;
      case "performers":
        setSelectedPerformersImageId(imageId);
        break;
      case "location":
        setSelectedLocationImageId(imageId);
        break;
    }
  }

  async function handleSubmit() {
    // Validate at least one image is selected
    const selectedImages = [
      selectedTimeDateImageId,
      selectedPerformersImageId,
      selectedLocationImageId,
    ].filter((id): id is number => id !== null);

    if (selectedImages.length === 0) {
      setError("Please select at least one image to post");
      return;
    }

    // Validate caption length
    if (caption.length > 2200) {
      setError("Caption must be 2,200 characters or less");
      return;
    }

    // Note: No validation for scheduled times being in the future.
    // The backend handles past/present times by posting immediately.

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // First, select images
      const selectResult = await instagramApi.selectImages(flyer.id, {
        time_date_image_id: selectedTimeDateImageId,
        performers_image_id: selectedPerformersImageId,
        location_image_id: selectedLocationImageId,
      });

      if (!selectResult.ok) {
        setError(selectResult.error.message || "Failed to select images");
        return;
      }

      // Then, schedule each selected post
      const scheduledDateTime = postingMode === "now" 
        ? new Date().toISOString()
        : scheduledAt;

      const schedulePromises = selectResult.data.selected_posts.map((post) =>
        instagramApi.schedulePost(flyer.id, {
          image_id: post.flyer_generated_image_id,
          scheduled_at: scheduledDateTime,
          caption: caption || null,
          hashtags: hashtags || null,
        })
      );

      const scheduleResults = await Promise.all(schedulePromises);

      const hasError = scheduleResults.some((result) => !result.ok);
      if (hasError) {
        const errorMessage = scheduleResults.find((r) => !r.ok)?.error.message;
        setError(errorMessage || "Failed to schedule some posts");
      } else {
        setSuccess(
          postingMode === "now"
            ? "Posts are being published now!"
            : `Posts scheduled for ${new Date(scheduledDateTime).toLocaleString()}`
        );
        
        // Reload scheduled posts
        await loadScheduledPosts();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelPost(imageId: number) {
    setIsCanceling(imageId);
    setError(null);

    try {
      const result = await instagramApi.cancelScheduledPost(flyer.id, imageId);

      if (result.ok) {
        setSuccess("Post canceled successfully");
        await loadScheduledPosts();
      } else {
        setError(result.error.message || "Failed to cancel post");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsCanceling(null);
    }
  }

  const generatedImages = flyer.generated_images || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Schedule Instagram Posts
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: tokens.textSecondary,
            margin: 0,
          }}
        >
          Select images from each category and schedule them for posting on Instagram
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" style={{ marginBottom: "0" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" style={{ marginBottom: "0" }}>
          {success}
        </Alert>
      )}

      {/* Image Category Sections */}
      <ImageCategorySection
        categoryType="time_date"
        categoryLabel="Time/Date"
        images={generatedImages}
        selectedImageId={selectedTimeDateImageId}
        onSelectImage={(id) => handleSelectImage("time_date", id)}
        disabled={isSubmitting}
      />

      <ImageCategorySection
        categoryType="performers"
        categoryLabel="Performers"
        images={generatedImages}
        selectedImageId={selectedPerformersImageId}
        onSelectImage={(id) => handleSelectImage("performers", id)}
        disabled={isSubmitting}
      />

      <ImageCategorySection
        categoryType="location"
        categoryLabel="Location"
        images={generatedImages}
        selectedImageId={selectedLocationImageId}
        onSelectImage={(id) => handleSelectImage("location", id)}
        disabled={isSubmitting}
      />

      {/* Posting Options */}
      {(selectedTimeDateImageId ||
        selectedPerformersImageId ||
        selectedLocationImageId) && (
        <PostingOptionsCard
          caption={caption}
          hashtags={hashtags}
          scheduledAt={scheduledAt}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          onScheduledAtChange={setScheduledAt}
          onPostingModeChange={setPostingMode}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isLoading}
        />
      )}

      {/* Scheduled Posts */}
      <ScheduledPostsCard
        posts={scheduledPosts}
        onCancelPost={handleCancelPost}
        isCanceling={isCanceling}
      />
    </div>
  );
}
```

### Update Flyer Detail Page

**File:** `frontend/src/app/(authenticated)/flyers/[id]/page.tsx`

Add a button/link to navigate to Instagram scheduling page:

```typescript
// Add import
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

// Add in the component, after GeneratedImagesSection:
{flyer.generated_images && flyer.generated_images.length > 0 && (
  <div style={{ marginTop: "24px" }}>
    <Button
      onClick={() => router.push(`/flyers/${flyer.id}/instagram`)}
      variant="primary"
    >
      Schedule Instagram Posts
    </Button>
  </div>
)}
```

## Rollout plan and migration steps

1. **Create API Client**:
   - Create `frontend/src/lib/api/instagram.ts` with Instagram API methods
   - Update `frontend/src/lib/api/flyers.ts` types if needed

2. **Create Components**:
   - Create image selection components
   - Create posting options component
   - Create scheduled posts display component
   - Create status badge component

3. **Create Page Route**:
   - Create `frontend/src/app/(authenticated)/flyers/[id]/instagram/page.tsx`
   - Create main `InstagramSchedulingPage` component

4. **Update Flyer Detail Page**:
   - Add navigation link/button to Instagram scheduling page

5. **Testing**:
   - Test image selection (one per category)
   - Test "Post Now" functionality
   - Test "Schedule Later" functionality
   - Test caption and hashtag editing
   - Test scheduled posts display and cancellation
   - Test error handling
   - Test loading states

6. **Polish**:
   - Add transitions and animations
   - Improve responsive design
   - Add tooltips/help text where needed

## Risks and mitigations

### Risks

1. **Date/Time Picker Browser Support**: Not all browsers support `datetime-local`
   - **Mitigation**: Use a library like `react-datepicker` or check browser support and fallback

2. **Real-time Status Updates**: Status changes happen on backend, frontend needs to poll
   - **Mitigation**: Poll scheduled posts every 30 seconds, or use WebSockets in future

3. **Caption Generation**: Auto-generated captions might not be perfect
   - **Mitigation**: Allow full editing, show character count

4. **Multiple Image Selection**: Users might accidentally select multiple images per category
   - **Mitigation**: Use radio buttons (one selection), clear previous selection

5. **Network Failures**: API calls might fail during submission
   - **Mitigation**: Show clear error messages, allow retry, don't lose form data

## Observability and performance considerations

### Performance

- Lazy load images (already implemented with `loading="lazy"`)
- Debounce caption/hashtag input if needed
- Optimize re-renders with React.memo where appropriate
- Efficient state management (avoid unnecessary re-renders)

### User Experience

- Show loading spinners during API calls
- Disable form during submission
- Clear success/error messages after a few seconds
- Auto-scroll to newly scheduled posts
- Keyboard shortcuts for common actions (Enter to submit)

## Open questions / decisions needed

1. **Date/Time Picker Library**: Use native `datetime-local` or a library?
   - **Decision**: Start with native, upgrade to library if browser support issues

2. **Real-time Updates**: Poll scheduled posts or use WebSockets?
   - **Decision**: Poll every 30 seconds for MVP, WebSockets later

3. **Caption Auto-generation**: Always auto-generate or let user start fresh?
   - **Decision**: Auto-generate on page load, user can edit

4. **Multi-selection**: Allow multiple images per category later?
   - **Decision**: One per category for MVP, can enhance later

5. **Post Preview**: Show preview before scheduling?
   - **Decision**: Not in MVP, can add later

## Changelog

- 2025-01-30 — Added — Initial frontend feature plan created
- 2025-11-15 — Changed — Updated to reflect model refactoring:
  - Instagram posts are now separate from generated images
  - Updated types to use `InstagramPostRead` instead of extending `FlyerGeneratedImage`
  - Updated API response fields (`selected_posts` instead of `selected_images`)
  - Updated status field names (`post_status` instead of `instagram_post_status`)
  - Updated error field names (`post_error` instead of `instagram_post_error`)
  - Updated scheduled/posted field names (`scheduled_at`, `posted_at` instead of `instagram_scheduled_at`, `instagram_posted_at`)
  - Updated component to work with separate Instagram post model

