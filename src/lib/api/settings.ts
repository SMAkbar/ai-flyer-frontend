import { apiClient } from "./client";

export type UserMetaSettings = {
  id: number;
  user_id: number;
  meta_app_id: string;
  meta_app_secret: string;
  meta_access_token: string | null;
  instagram_user_id: string;
};

export type UserMetaSettingsUpdate = {
  meta_app_id: string;
  meta_app_secret: string;
  meta_access_token?: string | null;
  instagram_user_id: string;
};

export const settingsApi = {
  getMetaSettings: () => apiClient.get<UserMetaSettings>("/settings/meta"),
  updateMetaSettings: (data: UserMetaSettingsUpdate) =>
    apiClient.put<UserMetaSettings>("/settings/meta", data),
};

