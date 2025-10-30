# Dark Theme Design Language (Netflix-inspired)

Owners: Frontend Team (Design + Engineering)

## Summary and background

This document defines a dark-theme design language for the frontend, inspired by Netflix’s cinematic UI: immersive, content-first, high-contrast, and comfortable in low-light. It standardizes colors, typography, spacing, components, motion, accessibility, and usage patterns for a cohesive experience across the app.

## Goals and non-goals

- Goals
  - Establish a reusable dark UI system (tokens + components)
  - Optimize readability and comfort in low light
  - Emphasize content discovery via hero, rows/carousels, and rich cards
  - Provide accessible contrast and focus states
  - Support future theming (light/dark) via tokens
- Non-goals
  - Exact cloning of Netflix branding or proprietary assets
  - Full design system site; this is an implementation guide for this product

## Scope and assumptions

- Scope: Web app UI (Next.js App Router). Applies to layout, navigation, content cards, modals, lists, and forms.
- Assumptions: Tailwind or CSS modules; React Server Components by default; shared API client for data; no proprietary Netflix fonts.

## UX/UI design

### Visual principles
- Backgrounds: near‑black surfaces, layered subtly to convey depth.
- Content-first: large hero area, prominent artwork, minimal chrome.
- Hierarchy: typography scale + weight, not bright borders.
- Motion: subtle micro‑interactions (hover, focus, entry), performant and optional.

### Color system (tokens)
- Neutrals
  - bg.base: #141414 (near-black)
  - bg.elevated: #1A1A1A
  - bg.hover: #1F1F1F
  - bg.overlay: rgba(0,0,0,0.6)
  - text.primary: #E6E6E6
  - text.secondary: #B3B3B3
  - text.muted: #8C8C8C
  - border.default: #2A2A2A
- Accents
  - accent.primary: #E50914 (cinematic red)
  - accent.primary.hover: #F6121D
  - accent.subtle: #B80E17
  - success: #22C55E
  - warning: #F59E0B
  - danger: #EF4444
- Overlays
  - overlay.scrim: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(20,20,20,0.95) 100%)

Notes
- Prefer dark gray over pure black (#000) for comfort.
- Use off‑white text; avoid pure white for body copy.
- Verify contrast for AA/AAA where applicable.

### Typography
- Font family: Inter (primary) with system fallbacks; alternatives: IBM Plex Sans, Source Sans 3.
- Scale
  - Display: clamp(40px, 6vw, 72px) / 1.1 / 700
  - H1: 32px / 1.2 / 700
  - H2: 24px / 1.3 / 600
  - H3: 20px / 1.4 / 600
  - Body: 16px / 1.6 / 400
  - Caption: 14px / 1.5 / 400
- Tracking: default; tighten slightly for large headlines.
- Avoid ultra-thin weights on dark backgrounds.

### Spacing and layout
- Grid: 12‑column, max content width 1440px, gutters 24px (desktop), 16px (mobile).
- Container widths: 100% fluid to breakpoints; clamp hero to 1600px media edge bleed.
- Spacing scale: 4, 8, 12, 16, 24, 32, 40, 64.
- Corner radius: 8px default; 12px for large cards/dialogs.
- Borders: 1px solid #2A2A2A; prefer separators over heavy outlines.
- Shadows (on dark): low-opac glows; example: 0 8px 24px rgba(0,0,0,0.4) + 0 0 0 1px rgba(255,255,255,0.04).

### Iconography and imagery
- Icons: Lucide, Radix Icons, or Material Symbols (Rounded) for consistency.
- Artwork: prioritize high-resolution posters/hero images; auto-aspect crop 16:9, 2:3.
- Image overlays: use gradient scrims to ensure legible text on imagery.

### Motion and interaction
- Durations: 120–240ms (hover 120ms; entry 200–240ms).
- Easing: standard cubic-bezier(0.2, 0.8, 0.2, 1).
- Hover states
  - Cards: scale 1.03, elevate bg to bg.elevated, add subtle glow.
  - Buttons: background tint shift; never pure brightness jumps.
- Focus
  - 2px focus ring using accent.primary at 60% opacity with 2px gap.
  - Visible for keyboard users on all interactive elements.
- Reduce motion
  - Respect prefers-reduced-motion; disable non-essential animations.

### Accessibility
- Contrast: text vs background ≥ 4.5:1 for body; ≥ 3:1 for large text.
- Focus: always visible, non-color-only indicators where possible.
- Text: avoid long lines (>80ch); use comfortable line-height.
- Color usage: avoid blue-on-red or saturated-on-saturated on dark surfaces.

## Components (key patterns)

- App Shell
  - Top bar: translucent near-black, darkening on scroll; left brand, right account/actions.
  - Optional side navigation for dense catalogs; collapsible on desktop; overlay on mobile.
- Hero (billboard)
  - Full-bleed background image/video; overlay.scrim; title + synopsis + primary action.
  - Secondary actions: add-to-list, more-info.
- Rows / Carousels
  - Horizontal scroll of content cards; show partial next item to imply scroll.
  - Sections by genre or personalized groups; large and compact variants.
- Content Card
  - Poster with radius 8–12px; hover scale 1.03; optional quick actions.
  - Metadata on hover/expand: title, tags, runtime, rating.
  - Skeleton shimmering placeholders for loading.
- Details Modal / Page
  - Dim background with bg.overlay; emphasize artwork, synopsis, actions.
  - Tabs for Episodes/Similar/Details when applicable.
- Search and Filters
  - Prominent search; chips for filters; maintain contrast and clear states.
- Buttons
  - Primary: accent.primary background, text.primary on dark; hover: accent.primary.hover.
  - Secondary: bg.elevated with subtle border; hover: bg.hover.
- Forms
  - Inputs: bg.elevated; text.primary; placeholder text.muted; 1px border.default; focus ring.

## Data model and schema changes

- None required for visual design language. Ensure artwork URLs, aspect ratios, and basic metadata are available to support cards and hero.

## Rollout plan and migration steps

1. Introduce tokens and CSS variables under a theme file.
2. Update global styles (backgrounds, text colors, focus ring).
3. Implement core components: AppBar, Hero, RowCarousel, ContentCard, Dialog.
4. Migrate pages to compose from these components.
5. Add skeletons for loading states.
6. Verify accessibility and contrast.

## Risks and mitigations

- Overuse of saturation on dark: enforce muted palettes in tokens.
- Poor readability: test under varied lighting; adjust contrast and font weights.
- Performance with heavy imagery: use next/image, responsive sizes, and lazy loading.
- Legal/brand confusion: avoid Netflix trademarks; use unique accent and typography.

## Observability and performance

- Measure LCP for hero imagery; preconnect/CDN for images.
- Track CLS for carousels and skeleton transitions.
- Log interaction timings for hover previews.

## Open questions / decisions needed

- Final accent color confirmation (default provided is cinematic red).
- Confirm icon set (Lucide vs Material Symbols).
- Confirm Tailwind vs CSS variables-only implementation.

## Implementation notes (Next.js)

- Prefer Server Components for data fetch; use `next/image` for artwork.
- Centralize tokens in a `theme.css` with CSS variables; expose Tailwind config if used.
- Provide `error.tsx`/`loading.tsx` for key routes; use suspense for carousels.

## Componentization and reuse (structure and patterns)

- Tokens and shared styles
  - Source of truth: `frontend/src/components/theme/tokens.ts` exporting `tokens` and common `styles`.
  - Do not inline duplicate color/spacing values in components; import `tokens` instead.
- Base UI components (reusable)
  - `frontend/src/components/ui/Icon.tsx` — inline SVG path renderer.
  - `frontend/src/components/ui/Button.tsx` — `primary` and `secondary` variants; dark-theme hover handled internally.
  - `frontend/src/components/ui/Input.tsx` — dark-theme input styling.
  - `frontend/src/components/ui/Section.tsx` — standardized section container with title/subtitle.
  - `frontend/src/components/ui/Card.tsx` — optional hover elevation for dark surfaces.
- Feature components
  - `frontend/src/components/team/TeamMemberCard.tsx` — persona card.
  - `frontend/src/components/team/DashboardStat.tsx` — compact KPI widget with trend icon.
- Page composition
  - Pages import and compose these components; avoid redefining styles locally.
  - Use App Router Server Components by default; add `"use client"` only where interactivity is required (e.g., hover handlers in `Card`, `Button`).

## Import paths (Next.js alias)

- Prefer alias imports for components when available, e.g., `@/components/ui/Button`.
- Avoid deep relative paths (e.g., `../../components/...`).

## References

- Dark UI design principles and best practices
  - idevie — Dark theme UI tips: `https://idevie.com/design/ux/dark-theme-5-ui-design-tips`
  - Toptal — Designing dark UIs: `https://www.toptal.com/designers/ui/dark-ui-design`
  - Graphicfolks — Dark mode best practices: `https://graphicfolks.com/blog/dark-mode-design-best-practices/`
  - Xmethod — Dark theme UX: `https://www.xmethod.de/blog/diving-into-the-dark-exploring-dark-theme-ux-design-best-practices`
  - WeAreTenet — Dark mode design: `https://www.wearetenet.com/glossary/ui-ux/dark-mode-design`
  - Scaledots — Dark mode pitfalls: `https://www.scaledots.com/post/dark-mode-design-best-practices-and-pitfalls-to-avoid`

## Changelog

- 2025-10-30 — Added — Initial dark theme design language document.
- 2025-10-30 — Changed — Added componentization structure, tokens location, and import alias guidance; updated implementation notes to favor reusable components.
