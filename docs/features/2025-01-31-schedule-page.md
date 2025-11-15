# Schedule Page

Title: Schedule Page
Owners: Frontend team
Date: 2025-01-31
Slug: schedule-page

## Summary and background

Currently, users can only access Instagram post scheduling through the flyer detail page by clicking "Schedule Instagram Posts". There's no centralized view to see all scheduled posts across all flyers. This feature adds a dedicated Schedule page accessible from the sidebar that displays all scheduled Instagram posts with filtering, sorting, and management capabilities.

**Key Features:**
1. **Centralized Schedule View**: View all scheduled Instagram posts across all flyers in one place
2. **Sidebar Navigation**: Accessible from main navigation menu
3. **Post Management**: View, filter, sort, and cancel scheduled posts
4. **Status Tracking**: See post status (scheduled, posting, posted, failed)
5. **Flyer Context**: Link back to related flyer for each scheduled post

This feature builds on:
- Instagram posting scheduler (`2025-01-30-instagram-posting-scheduler.md`)
- Existing scheduled posts API endpoints
- Sidebar navigation system

## Goals and non-goals

### Goals
- Create a dedicated `/schedules` page accessible from sidebar
- Display all scheduled Instagram posts for the current user
- Show post status, scheduled time, flyer information, and image preview
- Allow filtering by status (scheduled, posting, posted, failed)
- Allow sorting by scheduled time (ascending/descending)
- Provide actions: view flyer, cancel scheduled post (if not posted)
- Show empty state when no scheduled posts exist
- Responsive design matching existing UI patterns

### Non-goals
- Editing scheduled posts (can be enhanced later)
- Bulk operations (can be added later)
- Calendar view (list view for MVP)
- Notifications/alerts (can be added later)
- Analytics/metrics (can be added later)

## Scope and assumptions

### Scope
- Frontend-only changes:
  - New `/schedules` page route
  - Schedule list component with filtering and sorting
  - Schedule item component with post details and actions
  - Sidebar navigation update
- Backend changes:
  - New endpoint to get all scheduled posts for current user
  - Repository method to query scheduled posts across all user's flyers

### Assumptions
- User is authenticated (page is in authenticated route group)
- Scheduled posts belong to flyers owned by the user
- Existing Instagram API endpoints work correctly
- ClockIcon is available for sidebar navigation

## UX/UI Design

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Schedules                                              │
│                                                         │
│  [Filter: All ▼]  [Sort: Scheduled Time ▼]            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Image]  Event Title                              │ │
│  │          📅 Scheduled: Jan 31, 2025 3:00 PM      │ │
│  │          📊 Status: Scheduled                     │ │
│  │          🎯 Type: Time/Date                       │ │
│  │          [View Flyer] [Cancel]                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Image]  Another Event                            │ │
│  │          📅 Scheduled: Feb 1, 2025 10:00 AM      │ │
│  │          📊 Status: Posted                        │ │
│  │          🎯 Type: Performers                      │ │
│  │          [View Flyer] [View on Instagram]         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  (Empty state if no scheduled posts)                   │
└─────────────────────────────────────────────────────────┘
```

### Components

1. **SchedulePage** (`frontend/src/app/(authenticated)/schedules/page.tsx`)
   - Main page component
   - Handles data fetching
   - Manages filter and sort state

2. **ScheduleList** (`frontend/src/components/schedules/ScheduleList.tsx`)
   - Displays list of scheduled posts
   - Handles filtering and sorting
   - Shows empty state

3. **ScheduleItem** (`frontend/src/components/schedules/ScheduleItem.tsx`)
   - Individual scheduled post card
   - Shows image preview, status, scheduled time
   - Provides action buttons

### Filtering

- Filter by status:
  - All (default)
  - Scheduled
  - Posting
  - Posted
  - Failed

### Sorting

- Sort by:
  - Scheduled Time (ascending - default)
  - Scheduled Time (descending)
  - Status
  - Flyer Title

## Data model and schema changes

### Backend API

**New Endpoint:**

**GET** `/api/instagram/scheduled`

Get all scheduled Instagram posts for the current user across all flyers.

```python
# Response
{
  "scheduled_posts": [
    {
      "id": int,
      "flyer_id": int,
      "flyer_title": str,  # Include flyer title for context
      "image_type": "time_date" | "performers" | "location",
      "cloudfront_url": str,
      "instagram_post_status": "pending" | "scheduled" | "posting" | "posted" | "failed",
      "instagram_scheduled_at": datetime | None,
      "instagram_posted_at": datetime | None,
      "instagram_post_id": str | None,
      "instagram_post_caption": str | None,
      "instagram_post_hashtags": str | null,
      "created_at": datetime,
    }
  ]
}
```

**Repository Method:**

```python
def get_all_scheduled_posts_for_user(
    db: Session,
    user_id: int,
) -> list[FlyerGeneratedImage]:
    """
    Get all scheduled posts across all flyers for a user.
    
    Returns:
        List of FlyerGeneratedImage records with flyer relationship loaded
    """
```

## Rollout plan and migration steps

1. **Backend Implementation**:
   - Add repository method `get_all_scheduled_posts_for_user`
   - Add router endpoint `GET /api/instagram/scheduled`
   - Update response schema to include flyer title

2. **Frontend Implementation**:
   - Update API client with `getAllScheduledPosts` method
   - Create Schedule page route
   - Create ScheduleList component
   - Create ScheduleItem component
   - Add Schedule link to sidebar
   - Export ClockIcon if not already exported

3. **Testing**:
   - Test with no scheduled posts (empty state)
   - Test with multiple scheduled posts
   - Test filtering by status
   - Test sorting
   - Test cancel action
   - Test navigation to flyer detail page

## Risks and mitigations

### Risks

1. **Performance**: Loading all scheduled posts could be slow with many posts
   - **Mitigation**: Add pagination if needed in future, limit initial query

2. **Data Consistency**: Posts might change status while viewing
   - **Mitigation**: Add refresh button, consider auto-refresh for active posts

3. **Missing Flyer Context**: Users might not remember which flyer a post belongs to
   - **Mitigation**: Always show flyer title and provide link to flyer detail

## Observability (metrics, logs), and performance considerations

### Logging
- Log when schedule page is accessed
- Log filter/sort changes
- Log cancel actions

### Performance
- Query uses indexes on `is_selected_for_posting` and `instagram_post_status`
- Join with flyers table to get flyer title
- Consider pagination if user has many scheduled posts

## Open questions / decisions needed

1. **Pagination**: Should we paginate scheduled posts?
   - **Decision**: No pagination for MVP, add if needed later

2. **Auto-refresh**: Should the page auto-refresh to show status changes?
   - **Decision**: Manual refresh for MVP, add auto-refresh later if needed

3. **Calendar View**: Should we add a calendar view?
   - **Decision**: List view for MVP, calendar view can be added later

## Changelog

- 2025-01-31 — Added — Initial feature plan created
- 2025-01-31 — Added — Backend endpoint `/api/instagram/scheduled` to get all scheduled posts for current user
- 2025-01-31 — Added — Repository method `get_all_scheduled_posts_for_user` with eager loading of flyer relationship
- 2025-01-31 — Added — Frontend Schedule page at `/schedules` with filtering and sorting
- 2025-01-31 — Added — ScheduleList and ScheduleItem components for displaying scheduled posts
- 2025-01-31 — Added — Schedule link in sidebar navigation with ClockIcon
- 2025-01-31 — Added — RefreshIcon component for refresh functionality

