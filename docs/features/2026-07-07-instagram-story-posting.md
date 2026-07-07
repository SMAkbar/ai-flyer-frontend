# Instagram Story Posting (Frontend)

**Date:** 2026-07-07

## Scheduling modes

The Instagram scheduling panel (`InstagramSchedulingPage`) offers three post types in a single radio row:

1. **Story + Feed** — story uses original flyer; feed uses combined image carousel
2. **Feed** — existing carousel workflow
3. **Story** — story only (no combined image picker or caption fields)

## Components

- `StoryPreview.tsx` — CSS preview of 9:16 story layout
- `InstaScheduleCal` — calendar slots colored by `post_type` (Feed / Story / Story + Feed)

## API client

New methods in `src/lib/api/instagram.ts`:

- `scheduleStory`, `getStory`, `cancelStory`, `rescheduleFailedStory`
- `scheduleStoryAndFeed`

`ScheduledPostSlot` includes `post_type`.
