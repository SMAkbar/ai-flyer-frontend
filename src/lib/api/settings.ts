import { apiClient } from "./client";

// =============================================================================
// Meta/Instagram Settings Types
// =============================================================================

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

// =============================================================================
// WordPress Settings Types
// =============================================================================

export type UserWordPressSettings = {
  id: number;
  user_id: number;
  wordpress_site_url: string;
  wordpress_username: string;
  wordpress_app_password: string;
  is_enabled: boolean;
};

export type UserWordPressSettingsUpdate = {
  wordpress_site_url: string;
  wordpress_username: string;
  wordpress_app_password?: string | null;
  is_enabled: boolean;
};

export type WordPressConnectionTestResponse = {
  success: boolean;
  message: string;
  user_id?: number | null;
  user_name?: string | null;
};

// =============================================================================
// Settings API
// =============================================================================

export const settingsApi = {
  // Meta/Instagram settings
  getMetaSettings: () => apiClient.get<UserMetaSettings>("/settings/meta"),
  updateMetaSettings: (data: UserMetaSettingsUpdate) =>
    apiClient.put<UserMetaSettings>("/settings/meta", data),
  getOAuthAuthorizeUrl: () =>
    apiClient.get<OAuthAuthorizeResponse>("/settings/meta/oauth/authorize"),
  handleOAuthCallback: (data: OAuthCallbackRequest) =>
    apiClient.post<OAuthCallbackResponse>("/settings/meta/oauth/callback", data),

  // WordPress settings
  getWordPressSettings: () =>
    apiClient.get<UserWordPressSettings>("/settings/wordpress"),
  updateWordPressSettings: (data: UserWordPressSettingsUpdate) =>
    apiClient.put<UserWordPressSettings>("/settings/wordpress", data),
  testWordPressConnection: () =>
    apiClient.post<WordPressConnectionTestResponse>("/settings/wordpress/test", {}),
};

