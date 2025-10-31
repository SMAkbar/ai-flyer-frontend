# Flyer Management UI (flyer-management)

Title: Flyer Management UI (flyer-management)
Owners: Frontend team

## Summary and background

Implement a complete flyer management user interface that allows users to create, view, and manage flyers with image uploads. The feature includes a flyer creation form with image upload preview and a visually appealing gallery/list view of all flyers. This feature integrates with the backend flyer management API to provide a seamless user experience.

## Goals and non-goals

### Goals
- Create a flyer creation page (`/flyers/create`) with form for title, description, and image upload
- Implement image preview before upload
- Create a flyers list page (`/flyers`) displaying all flyers in a responsive grid
- Display flyer cards with image, title, description, and creation date
- Add "Create Flyer" button on list page that redirects to creation page
- Support image file selection and preview
- Show loading states during API calls
- Display error messages for failed operations
- Show success messages after successful flyer creation
- Follow existing design system and component patterns
- Use Tailwind classes for styling (no inline styles)
- Separate form component from page component (follow ProfileForm pattern)

### Non-goals
- Image editing functionality (crop, resize, filters)
- Drag and drop file uploads (can be added later)
- Flyer deletion from UI (can be added later)
- Flyer editing/updating (can be added later)
- Image zoom/lightbox view (can be added later)
- Flyer sharing functionality (can be added later)
- Advanced filtering/sorting (can be added later)
- Infinite scroll pagination (standard pagination for now)

## Scope and assumptions

### Scope
- Frontend-only changes (pages, components, API integration)
- New flyer creation page with form
- New flyers list page with grid layout
- FlyerCard component for displaying individual flyers
- CreateFlyerForm component for form logic
- API client extension for multipart/form-data uploads
- Navigation updates (sidebar link)

### Assumptions
- User is authenticated when accessing flyer pages (enforced by existing middleware)
- Backend API endpoints are available and functional
- Backend `/flyers/` GET endpoint returns array of flyers
- Backend `/flyers/` POST endpoint accepts multipart/form-data
- CloudFront URLs are accessible and images load correctly
- Images are properly formatted (no need for client-side validation beyond file type)

## UX/UI design

### Flyer Creation Page (`/flyers/create`)

#### Layout
- **Container**: `max-w-4xl mx-auto` (matches profile page pattern)
- **Header**: Title "Create Flyer" with `text-2xl font-semibold`
- **Form Sections**:
  - **Flyer Details Card**: Title (required) and Description (optional) fields
  - **Image Upload Card**: File input with image preview

#### Form Fields
- **Title**: Required text input
- **Description**: Optional textarea (4 rows)
- **Image**: Required file input with `accept="image/*"`
- **Image Preview**: Shows selected image before upload (max-height: 300px, rounded, with border)

#### Actions
- **Cancel Button**: Secondary variant, redirects back
- **Create Flyer Button**: Primary variant, shows "Uploading..." when submitting

#### States
- **Loading**: Disabled form during submission
- **Error**: Red alert box at top with error message
- **Success**: Green alert box with success message, auto-redirect to dashboard after 1.5s

### Flyers List Page (`/flyers`)

#### Layout
- **Container**: `max-w-7xl mx-auto` (wider for grid layout)
- **Header Section**:
  - Left: Title "Flyers" with subtitle "Manage and view all your flyers"
  - Right: "Create Flyer" button that redirects to `/flyers/create`

#### Grid Layout
- **Responsive Grid**: 
  - Mobile (sm): 1 column
  - Tablet (sm): 2 columns
  - Desktop (lg): 3 columns
  - Large desktop (xl): 4 columns
- **Gap**: `gap-6` between cards

#### Flyer Cards
- **Image**: 16:9 aspect ratio, rounded corners, object-fit cover
- **Title**: Font weight 600, 16px, primary text color
- **Description**: Truncated to 2 lines with ellipsis, secondary text color
- **Date**: Small text, muted color, formatted as "Jan 27, 2025"

#### States
- **Loading**: "Loading flyers..." centered message
- **Error**: Error message with "Retry" button
- **Empty**: Centered message "No flyers yet. Create your first flyer!" with button
- **Loaded**: Grid of flyer cards

### Component Structure

#### CreateFlyerForm Component
- Located in `frontend/src/components/flyers/CreateFlyerForm.tsx`
- Handles form state (title, description, image, preview)
- Validates required fields (title, image)
- Validates image file type
- Calls `onSubmit` prop with FormData
- Displays validation errors

#### FlyerCard Component
- Located in `frontend/src/components/flyers/FlyerCard.tsx`
- Displays individual flyer in card format
- Uses Card component with `hoverElevate` prop
- Image preview with proper aspect ratio
- Formatted date display
- Truncated description with ellipsis

## Data model and API integration

### API Client Extension (`frontend/src/lib/api/client.ts`)
- Added `postForm()` method for multipart/form-data uploads
- Skips setting Content-Type header when body is FormData (browser handles it)

### Flyers API (`frontend/src/lib/api/flyers.ts`)
- `getAll()`: Fetches all flyers from GET `/flyers/`
- `create()`: Creates flyer via POST `/flyers/` with FormData

### Type Definitions
```typescript
type FlyerRead = {
  id: number;
  title: string;
  description: string | null;
  cloudfront_url: string;
  s3_key: string;
  created_at: string;
}
```

## Component files

### Pages
- `frontend/src/app/flyers/page.tsx` - Flyers list page
- `frontend/src/app/flyers/create/page.tsx` - Flyer creation page

### Components
- `frontend/src/components/flyers/FlyerCard.tsx` - Individual flyer card display
- `frontend/src/components/flyers/CreateFlyerForm.tsx` - Flyer creation form

### API
- `frontend/src/lib/api/flyers.ts` - Flyers API client
- `frontend/src/lib/api/client.ts` - Extended with `postForm()` method

### Navigation
- `frontend/src/components/layout/Sidebar.tsx` - Updated with "Flyers" link

## Styling approach

### Design System Compliance
- Uses Tailwind utility classes (no inline styles except for specific component requirements)
- Follows dark theme design language tokens
- Uses existing UI components (Button, Input, Card)
- Matches spacing and typography from profile page
- Uses proper responsive breakpoints

### Color and Typography
- Primary text: `tokens.textPrimary` (#E6E6E6)
- Secondary text: `tokens.textSecondary` (#B3B3B3)
- Muted text: `tokens.textMuted` (#8C8C8C)
- Cards: `tokens.bgHover` background with `tokens.border`
- Error messages: Red with dark mode variants
- Success messages: Green with dark mode variants

### Layout Patterns
- Container: `max-w-4xl` for forms, `max-w-7xl` for grids
- Spacing: Tailwind spacing scale (mb-6, gap-6, p-6)
- Cards: Border radius 12px, padding 16-24px
- Forms: Section spacing with `space-y-6`

## Rollout plan and migration steps

1. **Component Development**:
   - Create CreateFlyerForm component
   - Create FlyerCard component
   - Extend API client with postForm method

2. **Page Implementation**:
   - Create `/flyers/create` page
   - Create `/flyers` page
   - Update sidebar navigation

3. **Testing**:
   - Test form validation
   - Test image preview functionality
   - Test API integration
   - Test responsive grid layout
   - Test error handling
   - Test loading states

4. **Integration**:
   - Verify backend API endpoints are available
   - Test end-to-end flyer creation flow
   - Verify CloudFront image URLs load correctly

## Risks and mitigations

### User Experience Risks
- **Risk**: Large images causing slow page loads
- **Mitigation**: Images are served via CloudFront CDN; consider lazy loading in future

- **Risk**: Image preview not working for certain file types
- **Mitigation**: Use FileReader API with proper error handling; validate file types

- **Risk**: Form submission errors not clearly communicated
- **Mitigation**: Display clear error messages with context; handle network errors gracefully

### Technical Risks
- **Risk**: CORS issues with CloudFront URLs
- **Mitigation**: Ensure CloudFront has proper CORS headers; handle image load errors

- **Risk**: Browser compatibility with FileReader API
- **Mitigation**: Use modern browsers; add polyfills if needed

- **Risk**: Form state loss on navigation
- **Mitigation**: Consider form state persistence if needed (not critical for this feature)

### Performance Risks
- **Risk**: Large image previews causing memory issues
- **Mitigation**: Set max-height on preview; consider compression for preview

## Observability and performance

### Error Tracking
- Log API errors with details
- Track file upload failures
- Monitor image load failures

### Performance Metrics (Future)
- Track form submission times
- Monitor page load times
- Track image load performance
- Measure grid rendering performance

### User Analytics (Future)
- Track flyer creation frequency
- Monitor page navigation patterns
- Track image upload success rates

## Open questions / decisions needed

1. **Image Optimization**: Should we compress/resize images client-side before upload?
2. **Pagination**: Should we implement pagination or infinite scroll for large flyer lists?
3. **Caching**: Should we cache flyer list data or always fetch fresh?
4. **Image Lazy Loading**: Should we implement lazy loading for flyer images in grid?
5. **Accessibility**: Do we need additional ARIA labels or keyboard navigation?
6. **Error Recovery**: Should we implement retry mechanisms for failed uploads?
7. **File Size Limits**: Should we show file size limits to users before upload?

## Changelog

- 2025-01-27 — Added — Initial flyer management UI implementation:
  - Created CreateFlyerForm component with title, description, and image upload fields
  - Added image preview functionality before upload
  - Created FlyerCard component for displaying flyers in grid
  - Implemented flyers list page (`/flyers`) with responsive grid layout
  - Implemented flyer creation page (`/flyers/create`) with form
  - Extended API client with `postForm()` method for multipart/form-data uploads
  - Added flyers API helper with `getAll()` and `create()` methods
  - Updated sidebar navigation with "Flyers" link
  - Added proper error handling and loading states
  - Implemented success messages and redirects
  - Followed existing design system patterns with Tailwind classes
  - Matched component structure with ProfileForm pattern

