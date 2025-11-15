# Authentication UI and Middleware (authentication)

Title: Authentication UI and Middleware (authentication)
Owners: Frontend team

## Summary and background
Add a login page and middleware to guard routes using a JWT stored in a cookie.

## Goals and non-goals
- Goals: Login UI, call backend login, set JWT cookie, route protection middleware
- Non-goals: Sign-up UI, refresh tokens, role-based UI

## Scope and assumptions
- Reads `NEXT_PUBLIC_API_BASE_URL` to target backend
- Stores token in a client-accessible cookie named `token` (simple dev flow)

## UX/UI design
- Route: `/login` under `src/app/(auth)/login/page.tsx`
- Simple form with email + password and submit button
- On success, redirect to `/`

## Middleware design
- `frontend/middleware.ts`: redirects to `/login` if no `token` cookie on non-public paths
- Public paths: `/login`, `/_next/*`, `/favicon.ico`, `/public/*`

## API interactions
- POST `/auth/login` with `{ email, password }` → `{ access_token }`
- Use shared API client in `src/lib/api/client.ts`; `authApi.login` in `src/lib/api/auth.ts`

## Rollout plan
- Ensure backend runs at `http://localhost:8000` and env is set in dev

## Risks and mitigations
- Token in JS-accessible cookie → use httpOnly cookie set by backend in prod

## Observability
- Surface login errors inline; consider client logs later

## Changelog
2025-10-30 — Added — Login page, API client, and route-protecting middleware



