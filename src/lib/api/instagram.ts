import { apiClient } from "./client";
import type { FlyerGeneratedImage } from "./flyers";

export type PostStatus = "pending" | "scheduled" | "posting" | "posted" | "failed";

export type ScheduledPostRead = FlyerGeneratedImage & {
  instagram_post_status: PostStatus;
  instagram_post_id: string | null;
  instagram_post_error: string | null;
  instagram_post_caption: string | null;
  instagram_post_hashtags: string | null;
  is_selected_for_posting: boolean;
};

export type SelectImagesRequest = {
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
};

export type SelectImagesResponse = {
  flyer_id: number;
  selected_images: ScheduledPostRead[];
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
  scheduled_posts: ScheduledPostRead[];
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
};

