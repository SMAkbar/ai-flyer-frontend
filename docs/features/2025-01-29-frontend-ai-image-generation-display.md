# Frontend Display for AI Image Generation (frontend-ai-image-generation)

Title: Frontend Display for AI Image Generation (frontend-ai-image-generation)
Owners: Frontend team
Date: 2025-01-29
Slug: frontend-ai-image-generation

## Summary and background

When flyer information extraction completes with **all extracted fields having individual confidence levels above 90%**, the backend automatically generates three promotional images (time/date, performers, location). The frontend needs to display these generated images in the flyer detail page, allowing users to view, download, and potentially use them for Instagram posting.

This feature builds on:
- Backend AI image generation feature (automatic generation when confidence > 90%)
- Existing flyer detail page (`/flyers/[id]`)
- Flyer API client infrastructure

## Goals and non-goals

### Goals
- Display generated images for a flyer in the detail page
- Show all three image types (time/date, performers, location) when available
- Provide image download functionality
- Show image generation status (loading, completed, failed)
- Display images in a clean, grid-based layout
- Show empty state when no images are generated yet
- Handle loading states gracefully
- Display image metadata (type, creation date)
- Make images responsive and accessible

### Non-goals
- Instagram posting functionality (backend stores metadata only)
- Image editing/manipulation
- Manual image regeneration (automatic only from backend)
- Image quality tier selection (uses backend default Basic tier)
- Image preview modal/lightbox (can be added later)
- Batch download functionality (individual download only)

## Scope and assumptions

### Scope
- Frontend-only changes:
  - Add generated images endpoint to flyer detail API response
  - Create API client functions for generated images
  - Create UI components to display generated images
  - Integrate into existing flyer detail page
  - Handle loading and error states
  - Add download functionality for images

### Assumptions
- Backend endpoint will include generated images in flyer detail response or provide separate endpoint
- Generated images are accessible via CloudFront URLs
- Images are PNG format
- Image generation happens asynchronously (may not be immediately available)
- Users can download images directly via URL
- Generated images are automatically created when extraction confidence > 90%

## UX/UI design

### Flyer Detail Page Integration

The generated images section will be added below the extracted information card on the flyer detail page:

```
[Flyer Image]
[Flyer Title and Description]
[Extracted Information Card]
[Generated Images Section] <- NEW
```

### Generated Images Section

**Layout:**
- Section title: "Generated Promotional Images"
- Grid layout: 3 columns on desktop, 1 column on mobile
- Each image card shows:
  - Image preview
  - Image type label (Time/Date, Performers, Location)
  - Download button
  - Creation timestamp
- Empty state when no images available
- Loading state while images are being generated

**Visual Design:**
- Use existing Card component for consistency
- Images displayed in 1:1 aspect ratio containers
- Download button with icon
- Subtle loading animation
- Error state if image fails to load

### Empty State

When no images are generated yet (or generation in progress):
- Show message: "No promotional images generated yet"
- Subtext: "Images will be automatically generated when all extracted fields have confidence above 90%"
- Show loading indicator if extraction is in progress

### Loading State

When images are being generated:
- Show skeleton loaders or placeholder cards
- Show message: "Generating promotional images..."
- Auto-refresh or polling until images are available

## API design

### Backend Endpoint (to be added)

#### Option 1: Include in FlyerDetailRead response
Update `FlyerDetailRead` schema to include `generated_images: List[FlyerGeneratedImageRead] | None`

#### Option 2: Separate endpoint
`GET /flyers/{flyer_id}/generated-images` returns `List[FlyerGeneratedImageRead]`

**Recommendation:** Option 1 (include in detail response) for simplicity and fewer API calls.

### Frontend API Client

```typescript
// In frontend/src/lib/api/flyers.ts

export type GeneratedImageType = "time_date" | "performers" | "location";

export type FlyerGeneratedImageRead = {
  id: number;
  flyer_id: number;
  image_type: GeneratedImageType;
  cloudfront_url: string;
  instagram_post_content: string | null;
  instagram_posted_at: string | null;
  instagram_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FlyerDetailRead = FlyerRead & {
  information_extraction: FlyerInformationExtraction | null;
  generated_images?: FlyerGeneratedImageRead[]; // NEW
};

// API function (if separate endpoint needed)
export const flyersApi = {
  // ... existing methods
  getGeneratedImages: (id: number) => 
    apiClient.get<FlyerGeneratedImageRead[]>(`/flyers/${id}/generated-images`),
};
```

## Implementation details

### File Structure

```
frontend/src/
├── lib/
│   └── api/
│       └── flyers.ts              # Update types and add API function
├── components/
│   └── flyers/
│       ├── GeneratedImagesSection.tsx   # NEW - Main section component
│       └── GeneratedImageCard.tsx       # NEW - Individual image card
└── app/
    └── (authenticated)/
        └── flyers/
            └── [id]/
                └── page.tsx             # Update to include generated images
```

### Component Design

#### `GeneratedImagesSection.tsx`
- Props: `flyerId: number`, `images: FlyerGeneratedImageRead[] | null`, `isLoading: boolean`
- Handles empty state, loading state, and grid layout
- Maps over images and renders `GeneratedImageCard` for each

#### `GeneratedImageCard.tsx`
- Props: `image: FlyerGeneratedImageRead`
- Displays image preview, type label, download button, timestamp
- Handles image load errors

### Integration Points

1. **Flyer Detail Page** (`app/(authenticated)/flyers/[id]/page.tsx`)
   - Add state for generated images
   - Fetch images from API (or from flyer detail response)
   - Render `GeneratedImagesSection` component
   - Handle loading and error states

2. **API Client** (`lib/api/flyers.ts`)
   - Update `FlyerDetailRead` type to include `generated_images`
   - Add `getGeneratedImages()` function if separate endpoint is needed

### Error Handling

- Image load errors: Show placeholder icon
- API errors: Show error message with retry button
- Missing images: Show empty state with helpful message

### Responsive Design

- Desktop: 3-column grid
- Tablet: 2-column grid
- Mobile: 1-column stack
- Use CSS Grid with `repeat(auto-fit, minmax(300px, 1fr))`

## Rollout plan and migration steps

1. **Backend Updates** (if needed):
   - Add generated images to `FlyerDetailRead` response or create separate endpoint
   - Update backend schemas

2. **Frontend Implementation Order**:
   1. Update API client types (`flyers.ts`)
   2. Create `GeneratedImageCard` component
   3. Create `GeneratedImagesSection` component
   4. Integrate into flyer detail page
   5. Add loading and error states
   6. Test with real data

3. **Testing**:
   - Test with flyers that have generated images
   - Test with flyers that don't have images yet
   - Test loading states
   - Test error states (image load failures, API errors)
   - Test responsive layout on different screen sizes
   - Test download functionality

## Risks and mitigations

### Risks

1. **Backend endpoint not available**: Generated images may not be included in response initially
   - **Mitigation**: Implement separate API call as fallback, handle gracefully with loading state

2. **Images not yet generated**: Images may take time to generate after extraction completes
   - **Mitigation**: Show loading state, implement polling or refresh mechanism

3. **Image load failures**: CloudFront URLs may be invalid or images may fail to load
   - **Mitigation**: Implement error handling with fallback placeholder, log errors

4. **Performance**: Loading multiple images simultaneously may be slow
   - **Mitigation**: Lazy load images, use proper image optimization attributes

## Observability and performance considerations

### Performance
- Lazy load images (use `loading="lazy"` attribute)
- Use proper image sizing to avoid layout shift
- Consider using Next.js Image component for optimization

### User Experience
- Show loading indicators while images are being generated
- Auto-refresh or polling to check for new images
- Smooth transitions between states (loading → loaded → error)

### Accessibility
- Alt text for images (use image type as alt text)
- Keyboard navigation for download buttons
- ARIA labels for loading states

## Open questions / decisions needed

1. **Endpoint Design**: Include in detail response or separate endpoint?
   - **Decision**: Include in detail response for simplicity

2. **Auto-refresh**: Should we poll for images or rely on manual refresh?
   - **Decision**: Implement polling with reasonable interval (every 5-10 seconds) when extraction is completed

3. **Image Optimization**: Use Next.js Image component or standard img tag?
   - **Decision**: Use standard img tag initially (CloudFront URLs), can optimize later with Next.js Image

4. **Download Method**: Direct download via link or save dialog?
   - **Decision**: Direct download via `<a download>` attribute

## Changelog

- 2025-01-29 — Added — Initial feature plan created
- 2025-01-29 — Added — Backend updated to include generated images in FlyerDetailRead response
- 2025-01-29 — Added — Frontend API client types updated with GeneratedImageType and FlyerGeneratedImage
- 2025-01-29 — Added — GeneratedImageCard component created with download functionality
- 2025-01-29 — Added — GeneratedImagesSection component created with loading and empty states
- 2025-01-29 — Added — Generated images section integrated into flyer detail page
- 2025-11-03 — Changed — Updated image generation trigger description:
  - Images are now generated when ALL extracted fields with data have individual confidence > 90%
  - Uses per-field confidence levels instead of overall confidence level
  - Fields without data are skipped in the confidence check

