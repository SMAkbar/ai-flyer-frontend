# Frontend Flyer Management Enhancements

Title: Frontend Flyer Management Enhancements
Owners: Frontend team
Date: 2026-05-06
Slug: frontend-flyer-management-enhancements

## Summary and background

This document captures recently shipped frontend enhancements across flyer management and scheduling. The updates add paginated browsing with filtering and sorting controls, event-date sorting options, a dedicated archives page with unarchive actions, calendar-assisted Instagram scheduling UX, and duplicate upload safeguards in flyer creation.

## Goals and non-goals

### Goals
- Expose backend pagination/filter/sort capabilities in flyer list UI
- Add event-date-based sorting options in list controls
- Provide a dedicated archives experience with unarchive actions
- Improve Instagram scheduling with a calendar-driven date/time selection UX
- Detect and confirm duplicate uploads before final flyer creation

## Scope and assumptions

### Scope
- `flyers` list page: query-param page navigation, status/search/sort controls, polling for active extractions
- `archives` page: paginated archived list + unarchive controls
- Create flyer flow: duplicate-check confirmation modal path
- Instagram scheduling flow: FullCalendar month view + date click scheduling editor
- API layer updates for list query params, archive/unarchive, and hash check calls

### Assumptions
- Backend list and archive endpoints return `FlyerListPageResponse`
- Backend duplicate-check API is available before create submission
- Scheduling APIs return occupied timeslots and accept ISO datetime values
- Users are authenticated in protected routes (`(authenticated)` pages)

## UX/UI design

### Flyers list page improvements
- Added client-side controls for:
  - search input (debounced)
  - status filter selector
  - sort selector (`latest`, `oldest`, `latest_event`, `oldest_event`)
- Added URL page state (`?page=N`) with previous/next controls.
- Added contextual extraction-progress banner tied to backend `extractions_active`.

### Archives page
- Added dedicated `/archives` route with paginated archived flyer grid.
- Added unarchive action on archive cards (modal confirmation path).
- Reused card/grid design for consistency with active flyers.

### Calendar scheduling UX
- Added `InstaScheduleCal` as a scheduling calendar surface:
  - month view using FullCalendar
  - loads occupied slots from API
  - click-to-open schedule editor with date/time picker
  - validates minimum lead time and writes selected schedule back to parent form state

### Duplicate upload UX
- Create flyer form now supports duplicate warning prompt:
  - if duplicate is found, submit is paused
  - user can cancel or explicitly confirm "Upload anyway"
  - prompt can reference an existing flyer title/id when available
- Bulk upload now follows a matching approval flow:
  - frontend calls bulk hash pre-check before upload
  - if duplicates are found, user sees manual confirmation with duplicate counts
  - upload continues only after explicit user confirmation

## API integration

### Flyers API client
- `flyersApi.getPage()` accepts pagination, search, status, sort and returns paginated payload.
- `flyersApi.checkImageHash()` posts image to duplicate-check endpoint.
- `flyersApi.checkBulkImageHashes()` posts multiple images for read-only duplicate analysis.
- `flyersApi.createBulk(formData, approveDuplicates)` supports explicit duplicate-approval submit path.
- `flyersApi.archive()` and delete remain available for card actions.

### Archives API client
- `archivesApi.get()` fetches paginated archived flyers.
- `archivesApi.unarchive()` restores archived flyer to active list.

### Scheduling API usage
- Calendar component consumes scheduling slot API calls from `instagramApi` to render occupied times.
- Selected datetime is propagated as ISO for schedule submission in posting flow.

## Implementation details

### Main files/components
- `src/app/(authenticated)/flyers/page.tsx`
  - list query orchestration, pagination state, controls, and polling
- `src/lib/api/flyers.ts`
  - list query types/path builder, hash-check call, sort/filter enums
- `src/app/(authenticated)/archives/page.tsx`
  - archived list pagination + reload behavior
- `src/lib/api/archives.ts`
  - archives fetch/unarchive operations
- `src/components/flyers/FlyerCard.tsx`
  - archive/unarchive/delete action affordances and modal flows
- `src/components/flyers/CreateFlyerForm.tsx`
  - single + bulk duplicate prompt rendering and submit gating
- `src/app/(authenticated)/flyers/create/page.tsx`
  - bulk pre-check + manual confirmation + approved re-submit flow
- `src/components/flyers/InstaScheduleCal.tsx`
  - calendar rendering, slot tooltip, date click schedule editor

### Interaction behavior notes
- Pagination is URL-driven to preserve reload/share behavior.
- Search is debounced to reduce API churn.
- List polling starts only when `extractions_active > 0`.
- Calendar uses local date interaction and converts to ISO for API consistency.

## Rollout and testing notes

1. Validate list query wiring:
   - search + status + sort combinations
   - page transitions and bounds correction
2. Validate archive lifecycle from UI:
   - archive on active list card
   - visibility in archives page
   - unarchive action returns flyer to active list
3. Validate duplicate flow:
   - duplicate check positive + negative cases
   - "Upload anyway" path after confirmation
   - bulk pre-check duplicate counts and approved submit path
4. Validate schedule calendar:
   - occupied slot rendering
   - selecting valid future time
   - ISO propagation into scheduling submit

## Risks and mitigations

- **Risk**: Multiple list state sources (URL + local state) can drift.
  - **Mitigation**: page source of truth is URL query param and reload path normalizes bounds.
- **Risk**: Frequent polling can increase request load.
  - **Mitigation**: polling runs only while extractions are active.
- **Risk**: Calendar time zone confusion for users.
  - **Mitigation**: UI uses local date/time controls, backend still receives ISO timestamps.
- **Risk**: Duplicate prompts can interrupt bulk workflows.
  - **Mitigation**: explicit confirmation provides clear intentional override path.

## Observability and performance considerations

- Debounced search reduces repeated list fetches during typing.
- Paginated endpoints reduce payload and render cost compared with full-list fetches.
- Loading and error states are explicit in both flyers and archives pages.
- Lazy image loading remains active in card components where applicable.

## Changelog

- 2026-05-06 — Changed — Upgraded flyers page to paginated backend fetch with URL page state.
- 2026-05-06 — Added — Added list filters and sort options including event-date sort modes.
- 2026-05-06 — Added — Added dedicated archives page with paginated archived flyers and unarchive actions.
- 2026-05-06 — Added — Added calendar-assisted Instagram scheduling UX (`InstaScheduleCal`) for date/time selection.
- 2026-05-06 — Added — Added duplicate-upload confirmation UX integrated with hash-check flow.
- 2026-05-06 — Changed — Added bulk duplicate pre-check and manual approval flow before bulk upload submit.
