# User Profile and Navigation Menu (user-profile-navigation)

Title: User Profile and Navigation Menu (user-profile-navigation)
Owners: Frontend team

## Summary and background
Add user profile access and navigation enhancements to provide users with:
1. A burger menu in the top-right of the header with profile and logout options
2. A dedicated user profile page displaying user information and account details
3. Enhanced sidebar with user-related information and utilities that users can access

This feature builds upon the existing authentication system and provides a complete user management interface within the application shell.

## Goals and non-goals

### Goals
- Add a burger menu (user menu) in the top-right corner of the Header component
- Implement profile page route (`/profile`) with complete user information display and editing
- Add profile editing functionality with inline form editing for all user fields
- Add logout functionality that clears the authentication token and redirects to login
- Enhance sidebar with user utilities and information sections
- Fetch and display current user information from `/users/me` endpoint
- Update user profile via PATCH `/users/me` endpoint
- Support editing for all profile fields: first_name, last_name, phone_number, bio, avatar_url, timezone, date_of_birth, location fields, company, job_title, website_url
- Ensure responsive design for mobile and desktop views

### Non-goals
- Password change functionality (separate feature - requires current password verification)
- Email change functionality (separate feature - requires verification)
- Avatar file upload (file storage, separate feature - only URL editing for now)
- Account deletion/deactivation (separate feature)
- Email verification flows (separate feature)

## Scope and assumptions

### Scope
- Frontend changes for profile display and editing (backend API endpoints must be implemented first)
- Header component enhancement with user menu dropdown
- New profile page route with view and edit modes
- Profile editing forms for all user fields
- Logout functionality (client-side token removal)
- Sidebar enhancements for user utilities

### Assumptions
- User is authenticated when accessing profile page (enforced by existing middleware)
- JWT token is stored in a cookie named `token` (as per existing auth implementation)
- Backend `/users/me` GET endpoint returns `UserProfileRead` with all profile fields
- Backend `/users/me` PATCH endpoint accepts `UserUpdate` for partial profile updates
- User menu dropdown should work on both desktop and mobile devices
- All profile fields are optional (nullable) and can be left empty

## UX/UI design

### Header Burger Menu
- **Location**: Top-right corner of the Header component
- **Icon**: Burger/hamburger menu icon (☰ or similar)
- **Trigger**: Click/tap to open dropdown menu
- **Menu Items**:
  1. Profile (links to `/profile`)
  2. Logout (action button that logs out)
- **Behavior**: 
  - Dropdown closes when clicking outside or selecting an item
  - Dropdown should appear below the burger icon
  - Shows user email/name as context (optional enhancement)

### Profile Page
- **Route**: `/profile` under `src/app/profile/page.tsx`
- **Layout**: Uses the existing Shell layout (header + sidebar)
- **Modes**: View mode (default) and Edit mode (toggle button)
- **Content Sections** (when viewing):
  - **Basic Information Card**:
    - Email (read-only, displayed but not editable)
    - First Name, Last Name
    - Full Name (can be independent or computed)
    - Phone Number
    - Date of Birth
    - Bio (multi-line text area)
  - **Profile Picture Card**:
    - Avatar URL (input field, preview image if URL provided)
  - **Location Information Card**:
    - City, Country
    - Timezone (dropdown or text input)
  - **Professional Information Card**:
    - Company
    - Job Title
    - Website URL
  - **Account Information Card**:
    - Account created date (read-only)
    - Last updated date (read-only)
    - Last login date (read-only, if available)
- **Edit Mode**:
  - Same sections as view mode, but with form inputs
  - All fields editable except email and timestamps
  - Save and Cancel buttons
  - Inline validation for URL formats, phone numbers
  - Loading state during save operation
  - Success/error messages for save operations
- **Styling**: Consistent with existing dashboard/team pages, uses Card components, organized in sections

### Sidebar Enhancements
- **User Information Section** (at top or bottom of sidebar):
  - Current user email/name display
  - Profile link (quick access)
- **User Utilities Section**:
  - Profile
  - Account information
  - (Future: Settings, Preferences, etc.)
- **Visual Design**: Consistent with existing sidebar items, uses existing navigation patterns

### Logout Flow
- On logout click:
  1. Clear the `token` cookie
  2. Redirect to `/login` page
  3. Optionally show a brief "Logged out" message

## Data model and schema changes

### Frontend Types
- Create new `userApi` in `src/lib/api/user.ts` (or extend `authApi`):
  - `getProfile()`: Calls `GET /users/me` and returns `UserProfileRead`
  - `updateProfile(data: UserUpdate)`: Calls `PATCH /users/me` and returns `UserProfileRead`
- User types matching backend schemas:
  ```typescript
  type UserProfileRead = {
    id: number;
    email: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    date_of_birth: string | null; // ISO date string (YYYY-MM-DD)
    bio: string | null;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
    timezone: string | null;
    company: string | null;
    job_title: string | null;
    website_url: string | null;
    is_active: boolean;
    last_login: string | null; // ISO datetime
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
  }

  type UserUpdate = {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | null; // ISO date string
    bio?: string | null;
    avatar_url?: string | null;
    city?: string | null;
    country?: string | null;
    timezone?: string | null;
    company?: string | null;
    job_title?: string | null;
    website_url?: string | null;
  }
  ```

### Backend dependency
- Backend must implement `/users/me` GET and PATCH endpoints (see `backend/docs/features/2025-01-14-user-profile-api.md`)
- Backend User model must include all profile fields

## Technical implementation

### Components to Create/Modify

1. **Header Component** (`src/components/layout/Header.tsx`):
   - Add user menu button in top-right (burger icon)
   - Add dropdown menu component (conditional rendering based on open/closed state)
   - Use click-outside detection to close dropdown
   - Fetch user info for display (optional)

2. **New Component: UserMenu** (`src/components/layout/UserMenu.tsx`):
   - Reusable dropdown menu component
   - Menu items: Profile link, Logout button
   - Handles dropdown open/close state
   - Click-outside handler

3. **New Component: UserMenuDropdown** (or integrate into UserMenu):
   - Dropdown container with proper positioning
   - Menu items with hover states
   - Accessible (ARIA attributes, keyboard navigation)

4. **Profile Page** (`src/app/profile/page.tsx`):
   - Client Component (for interactivity and data fetching)
   - State management for view/edit modes
   - Fetches user data via `userApi.getProfile()`
   - Displays user information in Card components (view mode)
   - Form editing for all fields (edit mode)
   - Loading, error, and success states
   - Form validation (URLs, date format, etc.)

5. **New Component: ProfileForm** (`src/components/profile/ProfileForm.tsx`):
   - Reusable form component for profile editing
   - Handles form state and validation
   - Input fields for all profile fields
   - Submit handler that calls `userApi.updateProfile()`
   - Field-level validation (URL format, phone format, etc.)

6. **New Component: ProfileView** (`src/components/profile/ProfileView.tsx`):
   - Display-only component for profile information
   - Organized sections (Basic, Location, Professional, etc.)
   - Read-only format with labels and values
   - Handles null/empty values gracefully

7. **New Component: AvatarPreview** (`src/components/profile/AvatarPreview.tsx`):
   - Displays user avatar from URL if provided
   - Fallback/placeholder if no URL or invalid URL

8. **Sidebar Component** (`src/components/layout/Sidebar.tsx`):
   - Add user information section
   - Add profile link in navigation
   - User utilities section (when expanded)

### API Integration

- **New API Module** (`src/lib/api/user.ts`):
  ```typescript
  import { apiClient } from "./client";
  
  export const userApi = {
    getProfile: () => apiClient.get<UserProfileRead>("/users/me"),
    updateProfile: (data: UserUpdate) => 
      apiClient.patch<UserProfileRead, UserUpdate>("/users/me", data),
  };
  ```

### Styling
- Use existing design tokens and component patterns
- Ensure dropdown menu matches existing UI patterns (borders, hover states)
- Mobile-responsive: dropdown should work well on small screens

## Rollout plan and migration steps

### Phase 1: API Integration
1. Create `src/lib/api/user.ts` with `userApi` module
2. Add `getProfile()` and `updateProfile()` methods
3. Define TypeScript types: `UserProfileRead`, `UserUpdate`

### Phase 2: User Menu Component
1. Create `UserMenu` component with dropdown functionality
2. Integrate into Header component (top-right position)
3. Add logout functionality (cookie clearing + redirect)

### Phase 3: Profile View Components
1. Create `ProfileView` component for display mode
2. Create `AvatarPreview` component
3. Organize profile information into sections (Basic, Location, Professional, Account)

### Phase 4: Profile Edit Components
1. Create `ProfileForm` component with all input fields
2. Implement form validation (URLs, dates, phone numbers)
3. Add loading states and error handling
4. Implement save/cancel functionality

### Phase 5: Profile Page Integration
1. Create `/profile` page route
2. Implement view/edit mode toggling
3. Integrate ProfileView and ProfileForm components
4. Handle data fetching, updating, and state management
5. Add success/error messages

### Phase 6: Sidebar Enhancements
1. Add user information section to Sidebar
2. Add profile link to sidebar navigation
3. Add user utilities section for future expansion

### Phase 7: Testing and Polish
1. Test logout flow (token clearing, redirect)
2. Test profile page loading, editing, and error states
3. Test form validation for all field types
4. Test dropdown menu interactions (click outside, keyboard navigation)
5. Test responsive behavior on mobile devices
6. Test profile update flow end-to-end

## Risks and mitigations

### Risks
1. **Dropdown menu positioning**: May overflow on small screens or near screen edges
   - *Mitigation*: Use CSS positioning (absolute/fixed) with proper z-index, test on various screen sizes

2. **Click-outside detection**: May interfere with other click handlers
   - *Mitigation*: Use proper event handling (stopPropagation where needed), test thoroughly

3. **Token expiration during profile fetch**: `/auth/me` may fail if token expired
   - *Mitigation*: Handle 401 errors gracefully, redirect to login with proper error message

4. **Race conditions**: Multiple simultaneous menu opens/closes
   - *Mitigation*: Use React state management properly, debounce if needed

5. **Accessibility**: Dropdown may not be keyboard accessible
   - *Mitigation*: Implement proper ARIA attributes, keyboard navigation (Escape to close, Enter/Space to activate)

### Security Considerations
- Logout must properly clear the token cookie
- Ensure profile page respects authentication middleware
- No sensitive information exposed in client-side code

## Observability (metrics, logs), and performance considerations

### Performance
- Profile page should cache user data (React state or SWR/React Query if added later)
- Optimistically update UI after successful profile save (immediate feedback)
- Debounce form validation for better performance
- Dropdown menu should not cause layout shifts
- Minimize re-renders with proper React memoization
- Lazy load avatar images with error handling

### Observability
- Log logout events (client-side, optional)
- Log profile update events (which fields changed, success/failure)
- Monitor profile page load times
- Track errors from `/users/me` endpoint failures
- Track form validation errors (which fields fail most often)

### Error Handling
- Display user-friendly error messages if profile fetch fails
- Display field-level validation errors inline in form
- Handle network errors gracefully with retry options
- Show loading states during data fetching and saving
- Handle 401 errors (token expired) by redirecting to login
- Show success messages after successful profile updates

## Open questions / decisions needed

1. **User Menu Display**: Should the burger menu show user email/name, or just the icon?
   - *Recommendation*: Start with icon-only for cleaner UI, add user info on hover/tooltip if needed

2. **Profile Page Data**: Should profile page be server-rendered or client-rendered?
   - *Decision*: Client Component (required for form interactivity and edit mode)

3. **Form Validation**: Client-side only or also server-side?
   - *Recommendation*: Client-side validation for immediate feedback, server-side for security (backend handles)

4. **Field Grouping**: How to organize many profile fields on the page?
   - *Recommendation*: Group into logical sections (Basic Info, Location, Professional) in separate Card components

5. **Edit Mode UX**: Inline editing vs. separate edit page vs. modal?
   - *Decision*: Same page with view/edit mode toggle for simplicity

6. **Avatar Display**: Show placeholder if URL invalid or empty?
   - *Recommendation*: Show initials or generic avatar placeholder if no URL or invalid URL

7. **Sidebar User Info**: Should user information be always visible or only when sidebar is expanded?
   - *Recommendation*: Show minimal info (initials/avatar) when collapsed, full info when expanded

8. **Logout Confirmation**: Should we show a confirmation dialog before logout?
   - *Recommendation*: No confirmation initially (standard pattern), can be added as enhancement if needed

9. **Menu Animation**: Should dropdown have slide/fade animation?
   - *Recommendation*: Subtle fade-in for better UX

10. **Timezone Input**: Dropdown with timezone list or free text?
    - *Recommendation*: Start with text input for simplicity, enhance with timezone dropdown later if needed

## Changelog

_This section will be updated as implementation progresses._

