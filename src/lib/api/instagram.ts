import { apiClient } from "./client";

export type PostStatus = "pending" | "scheduled" | "posting" | "posted" | "failed";

export type InstagramPostRead = {
  id: number;
  flyer_generated_image_id: number;
  post_status: PostStatus;
  instagram_post_id: string | null;
  post_error: string | null;
  caption: string | null;
  hashtags: string | null;
  is_selected_for_posting: boolean;
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ScheduledPostRead = InstagramPostRead;

export type SelectImagesRequest = {
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
};

export type SelectImagesResponse = {
  flyer_id: number;
  selected_posts: InstagramPostRead[];
};

export type SchedulePostRequest = {
  image_id: number;
  scheduled_at: string; // ISO 8601 datetime
  caption: string | null;
  hashtags: string | null;
};

export type SchedulePostResponse = ScheduledPostRead;

export type ScheduledPostsResponse = {
  flyer_id: number;
  scheduled_posts: ScheduledPostWithFlyerRead[];
};

export type ScheduledPostWithFlyerRead = InstagramPostRead & {
  flyer_title: string;
  image_type: string;
  cloudfront_url: string | null;
};

export type AllScheduledPostsResponse = {
  scheduled_posts: ScheduledPostWithFlyerRead[];
};

export const instagramApi = {
  selectImages: (flyerId: number, data: SelectImagesRequest) =>
    apiClient.post<SelectImagesResponse>(
      `/flyers/${flyerId}/instagram/select-images`,
      data
    ),

  schedulePost: (flyerId: number, data: SchedulePostRequest) =>
    apiClient.post<SchedulePostResponse>(
      `/flyers/${flyerId}/instagram/schedule`,
      data
    ),

  getScheduledPosts: (flyerId: number) =>
    apiClient.get<ScheduledPostsResponse>(
      `/flyers/${flyerId}/instagram/scheduled`
    ),

  cancelScheduledPost: (flyerId: number, imageId: number) =>
    apiClient.del(`/flyers/${flyerId}/instagram/scheduled/${imageId}`),

  getConnectionStatus: () =>
    apiClient.get<{
      connected: boolean;
      instagram_account_id: string | null;
      instagram_username: string | null;
      facebook_page_id: string | null;
      connected_at: string | null;
    }>("/instagram/status"),

  getAllScheduledPosts: () =>
    apiClient.get<AllScheduledPostsResponse>("/instagram/scheduled"),
};

