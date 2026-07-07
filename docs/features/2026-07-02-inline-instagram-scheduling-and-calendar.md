# Inline Instagram Scheduling and Unlimited Schedule Calendar

Title: Inline Instagram Scheduling and Unlimited Schedule Calendar
Owners: Frontend team
Date: 2026-07-02
Slug: inline-instagram-scheduling-and-calendar

## Summary and background

This document captures frontend changes shipped on 2 July 2026:

1. **Inline Instagram carousel scheduling** on the flyer detail page (`/flyers/[id]`), matching the conditional-display pattern used for WordPress posting.
2. **Unlimited future navigation** on the Instagram “Schedule for Later” calendar so users can pick any future date, not only the next month or two.

The standalone route `/flyers/[id]/instagram` is retained as a revert path for the client.

## Goals and non-goals

### Goals

- Show the full Instagram scheduling flow on the flyer detail page after clicking **Schedule Instagram Posts**
- Dismiss the inline panel with a bottom **Cancel** / **Close** control (unmount resets local state)
- Auto-close the panel when flyer content changes materially (image regeneration, saved extraction edits, flyer navigation)
- Remove the artificial upper bound on calendar month navigation
- Load occupied schedule slots for whichever month range is currently visible

### Non-goals

- Removing the standalone `/flyers/[id]/instagram` page
- Changing backend scheduling limits (no max future date on the API)
- Updating Instagram auto-caption to include `event_end_date` ranges

## UX/UI design

### Inline Instagram scheduling (`/flyers/[id]`)

- **Schedule Instagram Posts** toggles `showInstagramScheduling` instead of navigating away
- Button is disabled while promotional images are generating (`isGeneratingImages`)
- Button label reflects `flyer.carousel_post_status` when set:
  - `posted` → “Instagram Posted”
  - `scheduled` → “Instagram Scheduled”
  - otherwise → “Schedule Instagram Posts”
- When open, `InstagramSchedulingPage` renders below the action buttons with `embedded` prop:
  - Section heading (`h2`) instead of page-level `h1`
  - **Original Flyer** preview card hidden (already shown in the left column)
  - Bottom **Cancel** (drafting) or **Close** (after posted) calls `onClose` — hides UI only; does not cancel a scheduled post (red **Cancel** in status panel still cancels the carousel)
- Panel auto-closes when:
  - User clicks bottom Cancel/Close
  - `flyerId` changes (prev/next navigation)
  - Image regeneration starts (`handleGenerateImages`)
  - Extraction save succeeds (`handleSaveAll`)
- Panel stays open after a successful schedule/post so the user can read status; they dismiss manually

### Schedule calendar (`InstaScheduleCal`)

Previously:

- `validRange.end` capped navigation at roughly two months ahead
- Scheduled slots were fetched once on mount for ~14 days back through ~1 month forward

Now:

- `validRange` sets only `start` (first day of previous month); **no `end`** — FullCalendar allows unlimited future months
- `datesSet` loads occupied slots for the visible range (`arg.start`–`arg.end`) whenever the user changes month
- Past calendar days remain non-clickable; confirmed times must still be at least one minute after now

## API integration

No new endpoints. Existing carousel and slot APIs:

| Client method | Endpoint | Use in this feature |
|---------------|----------|---------------------|
| `instagramApi.getCarousel` | `GET /flyers/{id}/instagram/carousel` | Restore draft/scheduled carousel on panel open |
| `instagramApi.scheduleCarousel` | `POST /flyers/{id}/instagram/schedule-carousel` | Post now or schedule |
| `instagramApi.cancelCarousel` | `DELETE /flyers/{id}/instagram/carousel` | Cancel scheduled carousel |
| `instagramApi.rescheduleFailedCarousel` | `DELETE /flyers/{id}/instagram/carousel/reschedule` | Reset failed carousel |
| `instagramApi.getScheduledSlotsInRange` | `GET /instagram/scheduled-slots?start=&end=` | Conflict chips for visible calendar range |

`scheduled_at` accepts any future ISO 8601 datetime; the backend does not enforce a maximum horizon.

## Implementation details

### Main files/components

- `src/app/(authenticated)/flyers/[id]/page.tsx`
  - `showInstagramScheduling` state; conditional render; auto-close triggers
- `src/components/flyers/InstagramSchedulingPage.tsx`
  - `embedded`, `onClose` props; inline layout; bottom dismiss button
  - `useEffect` depends on `flyer.id` only (avoids caption reset on parent refresh)
- `src/components/flyers/InstaScheduleCal.tsx`
  - `navigationValidRange` without `end`; `datesSet` + `loadSlotsForRange`
- `src/app/(authenticated)/flyers/[id]/instagram/page.tsx`
  - Standalone route; passes `onClose` back to flyer detail
- `AGENTS.md` — route table updated for inline scheduling

## Rollout and testing notes

1. Open a flyer with completed extraction and generated images → **Schedule Instagram Posts** → inline panel appears below buttons
2. Select combined image → preview and posting options appear
3. Choose **Schedule for Later** → navigate several months forward on the calendar → future days are clickable
4. Confirm a slot far in the future → schedule succeeds; occupied slots load for that month
5. Bottom **Cancel** while drafting → panel hides; reopen → fresh draft
6. Start **Regenerate Promotional Images** or save extraction edits while panel open → panel closes
7. Standalone `/flyers/[id]/instagram` still works with **Back** navigation

## Changelog

- 2026-07-02 — Added — Inline Instagram carousel scheduling on flyer detail page
- 2026-07-02 — Changed — Instagram schedule calendar: unlimited future navigation; slots loaded per visible month via `datesSet`
