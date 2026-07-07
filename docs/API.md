# Frontend API Client Documentation

This document provides a comprehensive reference for the frontend API client functions and types.

## API Client

All API calls go through the shared API client located at `frontend/src/lib/api/client.ts`.

### Base Configuration

- Base URL: Configured via `NEXT_PUBLIC_API_BASE_URL` environment variable
- Authentication: JWT Bearer token automatically included in requests
- Error Handling: Centralized error handling and response parsing

## Type Definitions

### FlyerGeneratedImage

```typescript
type ImageGenerationStatus = "requested" | "generating" | "generated" | "failed";

type FlyerGeneratedImage = {
  id: number;
  flyer_id: number;
  image_type: "time_date" | "performers" | "location" | "combined";
  cloudfront_url: string | null;  // Nullable until generated
  generation_status: ImageGenerationStatus;
  generation_error: string | null;
  created_at: string;
  updated_at: string;
};
```

### FlyerInformationExtraction

```typescript
type FlyerInformationExtraction = {
  id: number;
  flyer_id: number;
  status: ExtractionStatus;
  event_date: string | null;       // ISO date YYYY-MM-DD
  event_end_date: string | null;   // Optional multi-day end date (ISO)
  location_town_city: string | null;
  country: string | null;
  event_title: string | null;
  performers_djs_soundsystems: string | null;
  venue_name: string | null;
  field_confidence_levels: Record<string, string | null> | null;
  extracted_data_json: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};
```

**Key Points (FlyerGeneratedImage):**
- `cloudfront_url` is `null` until image generation completes successfully
- `generation_status` tracks the generation lifecycle
- `generation_error` contains error message if generation failed
- `image_type` includes `"combined"` for the date + location composite image
- No Instagram-related fields (handled by separate `InstagramPost` model)

**Key Points (FlyerInformationExtraction):**
- `event_end_date` is optional; when set, combined image generation uses a date-range layout
- Clearing `event_end_date` requires PATCH with `"event_end_date": null` in the request body

### InstagramPost

```typescript
type PostStatus = "pending" | "scheduled" | "posting" | "posted" | "failed";

type InstagramPostRead = {
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
```

**Key Points:**
- Separate model from `FlyerGeneratedImage`
- `flyer_generated_image_id` links to the generated image
- `post_status` tracks Instagram posting lifecycle
- `scheduled_at` and `posted_at` are separate fields

## API Functions

### Flyers API (`frontend/src/lib/api/flyers.ts`)

#### `flyersApi.getAll()`
Get all flyers for the current user.

**Returns:** `Result<FlyerRead[]>`

#### `flyersApi.getById(id: number)`
Get flyer detail including extraction and generated images.

**Returns:** `Result<FlyerDetailRead>`

**Response includes:**
- Flyer basic information
- `information_extraction` - Extraction data (if available)
- `generated_images` - Array of generated images with status

#### `flyersApi.getPage(params)`
Get paginated flyers for the current user.

**Parameters:**
```typescript
{
  skip: number;
  limit: number;
  search?: string;
  status?: "all" | "pending" | "processing" | "extracted" | "posted" | "failed";
  sort?: "latest" | "oldest" | "latest_event" | "oldest_event";  // default: "oldest_event"
}
```

**Returns:** `Result<FlyerListPageResponse>`

**Note:** When `sort` is omitted, the client and backend both default to `oldest_event`. The client omits `sort` from the query string when it equals `DEFAULT_FLYER_SORT`.

#### `flyersApi.updateExtraction(id: number, data: FlyerInformationExtractionUpdate)`
Update extraction fields for a flyer (partial PATCH).

**Parameters:**
```typescript
type FlyerInformationExtractionUpdate = {
  event_date?: string | null;       // ISO date YYYY-MM-DD
  event_end_date?: string | null;   // Optional multi-day end date; null clears when sent
  location_town_city?: string | null;
  country?: string | null;
  event_title?: string | null;
  performers_djs_soundsystems?: string | null;
  venue_name?: string | null;
};
```

**Returns:** `Result<FlyerInformationExtraction>`

#### `flyersApi.checkImageHash(file: File)` / `flyersApi.checkBulkImageHashes(files: File[])`
Read-only duplicate analysis before create.

**Single response (`FlyerImageHashCheckResponse`):**
```typescript
{
  flyer_hash: string;
  is_duplicate: boolean;
  existing_flyer: { id: number; title: string; is_archived: boolean } | null;
}
```

**Bulk response (`FlyerBulkHashCheckResponse`):** `matches_in_db[]` entries include `existing_flyer_is_archived: boolean`.

**Note:** Duplicate detection includes archived flyers (not only active list items).

#### `flyersApi.create(formData: FormData)`
Create a new flyer by uploading an image.

**Parameters:**
- `formData` - FormData with `image` file

**Returns:** `Result<FlyerRead>`

#### `flyersApi.generateImages(id: number)`
Manually trigger image generation for a flyer.

**Returns:** `Result<{ message: string }>`

**Note:** Generation happens asynchronously. Poll `getById()` to check `generation_status`.

### Instagram API (`frontend/src/lib/api/instagram.ts`)

#### `instagramApi.selectImages(flyerId: number, data: SelectImagesRequest)`
Select images for Instagram posting.

**Parameters:**
```typescript
{
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
}
```

**Returns:** `Result<SelectImagesResponse>`

**Response:**
```typescript
{
  flyer_id: number;
  selected_posts: InstagramPostRead[];
}
```

#### `instagramApi.schedulePost(flyerId: number, data: SchedulePostRequest)`
Schedule an Instagram post.

**Parameters:**
```typescript
{
  image_id: number;  // flyer_generated_image_id
  scheduled_at: string;  // ISO 8601 datetime
  caption: string | null;
  hashtags: string | null;
}
```

**Returns:** `Result<InstagramPostRead>`

#### `instagramApi.getScheduledPosts(flyerId: number)`
Get all scheduled posts for a flyer.

**Returns:** `Result<ScheduledPostsResponse>`

**Response:**
```typescript
{
  flyer_id: number;
  scheduled_posts: InstagramPostRead[];
}
```

#### `instagramApi.getAllScheduledPosts()`
Get all scheduled posts across all flyers for the current user.

**Returns:** `Result<AllScheduledPostsResponse>`

**Response:**
```typescript
{
  scheduled_posts: ScheduledPostWithFlyerRead[];
}
```

**Note:** Includes `flyer_title`, `image_type`, and `cloudfront_url` for display.

#### `instagramApi.cancelScheduledPost(flyerId: number, imageId: number)`
Cancel a scheduled post (only if not yet posted).

**Returns:** `Result<void>`

#### `instagramApi.getScheduledSlotsInRange(startIso: string, endIso: string)`
List occupied Instagram schedule slots (all users) between two ISO 8601 datetimes (inclusive).

**Query:** `GET /instagram/scheduled-slots?start={iso}&end={iso}`

**Returns:** `Result<{ slots: ScheduledPostSlot[] }>`

```typescript
type ScheduledPostSlot = {
  timeslot: string;   // ISO 8601
  flyer_name: string;
  flyer_id: number;
};
```

**Note:** The schedule calendar (`InstaScheduleCal`) calls this on every visible month change (`datesSet`). There is no maximum `end` date for scheduling; pass the visible calendar range.

#### `instagramApi.scheduleCarousel(flyerId: number, data: ScheduleCarouselRequest)`
Schedule or post now a 2-slide Instagram carousel (combined image + original flyer).

**Parameters:**
```typescript
{
  combined_image_id: number;
  time_date_image_id: number | null;   // legacy; send null
  performers_image_id: number | null;  // legacy; send null
  location_image_id: number | null;    // legacy; send null
  scheduled_at: string;  // ISO 8601; use ~1 min in the past for “post now”
  caption: string | null;
  hashtags: string | null;
}
```

**Returns:** `Result<InstagramCarouselPostRead>`

#### `instagramApi.getCarousel(flyerId: number)`
Get the current carousel post for a flyer (404 if none).

**Returns:** `Result<InstagramCarouselPostRead>`

#### `instagramApi.cancelCarousel(flyerId: number)`
Cancel a scheduled carousel post.

**Returns:** `Result<void>`

#### `instagramApi.rescheduleFailedCarousel(flyerId: number)`
Reset a failed carousel so the user can schedule again.

**Returns:** `Result<void>`

## Usage Examples

### Displaying Generated Images

```typescript
import { flyersApi } from "@/lib/api/flyers";

const result = await flyersApi.getById(flyerId);
if (result.ok) {
  const flyer = result.data;
  const images = flyer.generated_images || [];
  
  images.forEach(image => {
    switch (image.generation_status) {
      case "requested":
        // Show "Requested" badge
        break;
      case "generating":
        // Show loading spinner
        break;
      case "generated":
        // Show image preview with download button
        if (image.cloudfront_url) {
          // Display image
        }
        break;
      case "failed":
        // Show error message
        if (image.generation_error) {
          // Display error
        }
        break;
    }
  });
}
```

### Selecting and Scheduling Instagram Posts

```typescript
import { instagramApi } from "@/lib/api/instagram";

// Step 1: Select images
const selectResult = await instagramApi.selectImages(flyerId, {
  time_date_image_id: timeDateImageId,
  performers_image_id: performersImageId,
  location_image_id: locationImageId,
});

if (selectResult.ok) {
  // Step 2: Schedule each selected post
  for (const post of selectResult.data.selected_posts) {
    await instagramApi.schedulePost(flyerId, {
      image_id: post.flyer_generated_image_id,
      scheduled_at: new Date().toISOString(),  // Post now
      caption: "Event caption",
      hashtags: "#event #music",
    });
  }
}
```

### Displaying Scheduled Posts

```typescript
import { instagramApi } from "@/lib/api/instagram";

const result = await instagramApi.getAllScheduledPosts();
if (result.ok) {
  result.data.scheduled_posts.forEach(post => {
    // Access post details
    console.log(post.flyer_title);
    console.log(post.image_type);
    console.log(post.cloudfront_url);
    console.log(post.post_status);
    console.log(post.scheduled_at);
  });
}
```

## Status Handling

### Image Generation Status

- **requested**: Image generation request created, waiting to start
- **generating**: Image is currently being generated (show loading)
- **generated**: Image successfully generated (show image and download button)
- **failed**: Image generation failed (show error message)

### Post Status

- **pending**: Image selected but not scheduled
- **scheduled**: Post scheduled for future time
- **posting**: Currently being posted by cron job
- **posted**: Successfully posted to Instagram
- **failed**: Posting failed (check `post_error` for details)

## Error Handling

All API functions return a `Result<T, ApiError>` type:

```typescript
type Result<T, E = ApiError> = 
  | { ok: true; data: T }
  | { ok: false; error: E };

type ApiError = {
  message: string;
  statusCode?: number;
};
```

**Example:**
```typescript
const result = await flyersApi.getById(flyerId);
if (result.ok) {
  // Use result.data
  const flyer = result.data;
} else {
  // Handle error
  console.error(result.error.message);
  // Show error to user
}
```

## Best Practices

1. **Always check `result.ok`** before accessing `result.data`
2. **Handle loading states** - Show spinners while API calls are in progress
3. **Poll for status updates** - For async operations (image generation, posting), poll the API to check status
4. **Display status badges** - Show clear visual indicators for generation and post status
5. **Handle null values** - `cloudfront_url` may be `null` until generation completes
6. **Show error messages** - Display `generation_error` or `post_error` when status is "failed"

## Migration Notes

### Breaking Changes (2025-11-15)

- **Instagram fields removed from `FlyerGeneratedImage`**: All Instagram-related fields have been moved to the separate `InstagramPost` model
- **New status fields**: `generation_status` and `generation_error` added to `FlyerGeneratedImage`
- **Nullable `cloudfront_url`**: Now nullable until image generation completes
- **Separate Instagram API**: Use `instagramApi` for all Instagram-related operations

### Updated Type Names

- `ScheduledPostRead` now extends `InstagramPostRead` (not `FlyerGeneratedImage`)
- Response fields changed: `selected_posts` instead of `selected_images`
- Status fields: `post_status` instead of `instagram_post_status`
- Error fields: `post_error` instead of `instagram_post_error`

### Updates (2026-07-02)

- **Inline Instagram scheduling**: Carousel flow on `/flyers/[id]` via `InstagramSchedulingPage` (`embedded` prop); standalone `/flyers/[id]/instagram` retained
- **Schedule calendar**: `InstaScheduleCal` has no future month cap; `getScheduledSlotsInRange` is called per visible month
- **Flyer detail**: `carousel_post_status` on `FlyerRead` drives Schedule button label

See also:
- `docs/features/2026-07-02-inline-instagram-scheduling-and-calendar.md`
- Backend: `ai-flyer-backend/docs/features/2026-07-02-cross-month-combined-date-layout.md`

### Updates (2026-06-30)

- **Default list sort**: `GET /flyers` and the frontend client default to `sort=oldest_event`
- **Multi-day events**: `event_end_date` on extraction read/update types; optional AI extraction field
- **Duplicate checks**: `is_archived` / `existing_flyer_is_archived` on duplicate-check responses
- **Generated images**: `image_type` includes `"combined"` (date + location composite)
- **Constants**: `DEFAULT_FLYER_SORT = "oldest_event"` in `flyers.ts`; `DEFAULT_SORT_OPTION` in `flyerFilters.ts`

See also:
- `docs/features/2026-06-30-flyer-navigation-sort-and-multi-day-events.md`
- `docs/features/2026-07-02-inline-instagram-scheduling-and-calendar.md`
- Backend: `ai-flyer-backend/docs/features/2026-06-30-flyer-end-date-and-combined-image.md`
- Backend: `ai-flyer-backend/docs/features/2026-07-02-cross-month-combined-date-layout.md`

