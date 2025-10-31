import { apiClient } from "./client";

export type UserProfileRead = {
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
};

export type UserUpdate = {
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
};

export const userApi = {
  getProfile: () => apiClient.get<UserProfileRead>("/users/me"),
  updateProfile: (data: UserUpdate) =>
    apiClient.patch<UserProfileRead, UserUpdate>("/users/me", data),
};

