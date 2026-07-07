# Flyer Navigation, Sort Defaults, and Multi-Day Event Dates

Title: Flyer Navigation, Sort Defaults, and Multi-Day Event Dates
Owners: Frontend team
Date: 2026-06-30
Slug: frontend-flyer-navigation-sort-and-multi-day-events

## Summary and background

This document captures frontend enhancements shipped on 30 June 2026: keyboard navigation between flyers on the detail page, updated default list sorting, clearer duplicate-upload messaging for archived flyers, and optional multi-day event end dates in the extraction editor.

## Goals and non-goals

### Goals
- Allow quick prev/next flyer navigation from the detail page without returning to the list
- Default the flyers list to **Oldest First - Event Date**
- Surface archived status when duplicate uploads match an archived flyer
- Support optional `event_end_date` editing for multi-day events, including clear-in-field UX

### Non-goals
- Changing standalone `TIME_DATE` generated image layout (still driven by start date only)
- Bulk-editing end dates across multiple flyers

## UX/UI design

### Flyer detail keyboard navigation
- On `/flyers/[id]`, keyboard shortcuts navigate within the current filtered/sorted list:
  - **Shift + `<`** (Shift + comma) → previous flyer
  - **Shift + `>`** (Shift + period) → next flyer
- Shortcuts are ignored while focus is in an input, textarea, select, or contenteditable field
- Navigation preserves list query params (`filter`, `search`, `sort`) via the same URL builder used by prev/next buttons

### Flyers list sort default
- Sort dropdown default is **Oldest First - Event Date** (`oldest_event`)
- Dropdown order places that option first, followed by other event-date and created-date options
- `DEFAULT_SORT_OPTION` / `DEFAULT_FLYER_SORT` constants keep list, detail navigation, and API path building aligned

### Duplicate upload messaging
- Single and bulk duplicate prompts show `, archived` when the matched library flyer is archived
- Example: `Summer Fest (id 42, archived)`

### Multi-day end date editing
- **End Date (optional)** field appears below Event Date in `ExtractionCard`
- End date picker is disabled until a start date exists
- Minimum selectable end date is the start date
- When a value is set, a small **×** inside the field (right edge) clears the end date without a separate button
- Save sends explicit `null` for cleared end dates; unsaved-change detection treats date fields as nullable ISO values

## API integration

### Types (`src/lib/api/flyers.ts`)
- `FlyerInformationExtraction.event_end_date: string | null`
- `FlyerInformationExtractionUpdate.event_end_date?: string | null`
- `FlyerImageHashCheckResponse.existing_flyer.is_archived: boolean`
- `FlyerBulkHashCheckResponse.matches_in_db[].existing_flyer_is_archived: boolean`
- `DEFAULT_FLYER_SORT = "oldest_event"`

### Client calls
- `flyersApi.updateExtraction()` — PATCH partial extraction updates; include `event_end_date: null` to clear
- Duplicate-check responses now include archived flags consumed by `CreateFlyerForm`

## Implementation details

### Main files/components
- `src/app/(authenticated)/flyers/[id]/page.tsx`
  - keyboard shortcut handler, adjacent flyer navigation, nullable date save logic
- `src/app/(authenticated)/flyers/page.tsx`
  - default sort state and dropdown option order
- `src/lib/utils/flyerFilters.ts`
  - `DEFAULT_SORT_OPTION` re-export
- `src/lib/api/flyers.ts`
  - end-date and duplicate archived types; default sort constant
- `src/components/flyers/ExtractionCard.tsx`
  - optional end date field; `clearable` date picker wrapper
- `src/components/ui/DatePicker.tsx`
  - inline clear control (`clearable` prop)
- `src/components/flyers/CreateFlyerForm.tsx`
  - archived suffix in duplicate prompt copy
- `src/components/flyers/FlyerCard.tsx`, `FlyersGrid.tsx`
  - default sort prop for detail links

## Rollout and testing notes

1. Open a flyer from a filtered/sorted list and verify Shift+< / Shift+> moves through the same ordering
2. Load `/flyers` fresh and confirm **Oldest First - Event Date** is selected by default
3. Upload a duplicate of an archived flyer and confirm `, archived` appears in the warning
4. Set, clear (via ×), save, and reload an end date on the detail page
5. Regenerate combined images after end-date edits to pick up backend layout changes

## Changelog

- 2026-06-30 — Added — Flyer detail keyboard navigation (Shift+< / Shift+>)
- 2026-06-30 — Changed — Default flyers sort to `oldest_event`; reordered sort dropdown
- 2026-06-30 — Changed — Duplicate prompts label archived matches
- 2026-06-30 — Added — Optional end date field with inline clear control and nullable PATCH save path
