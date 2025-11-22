import { apiClient } from "./client";

export type UserMetaSettings = {
  id: number;
  user_id: number;
  meta_app_id: string;
  meta_app_secret: string;
  meta_access_token: string | null;
  instagram_user_id: string;
  token_expires_at: string | null;
};

export type UserMetaSettingsUpdate = {
  meta_app_id: string;
  meta_app_secret: string;
  meta_access_token?: string | null;
  instagram_user_id: string;
};

export type OAuthAuthorizeResponse = {
  auth_url: string;
  state: string;
};

export type OAuthCallbackRequest = {
  code: string;
  state: string;
};

export type OAuthCallbackResponse = {
  success: boolean;
  message: string;
};

export const settingsApi = {
  getMetaSettings: () => apiClient.get<UserMetaSettings>("/settings/meta"),
  updateMetaSettings: (data: UserMetaSettingsUpdate) =>
    apiClient.put<UserMetaSettings>("/settings/meta", data),
  getOAuthAuthorizeUrl: () =>
    apiClient.get<OAuthAuthorizeResponse>("/settings/meta/oauth/authorize"),
  handleOAuthCallback: (data: OAuthCallbackRequest) =>
    apiClient.post<OAuthCallbackResponse>("/settings/meta/oauth/callback", data),
};

