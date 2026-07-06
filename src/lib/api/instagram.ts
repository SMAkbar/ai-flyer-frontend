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
  items: ScheduledPostWithFlyerRead[];
  total: number;
};

export type ScheduledPostWithFlyerRead = InstagramPostRead & {
  flyer_id: number | null;
  flyer_title: string;
  image_type: string;
  cloudfront_url: string | null;
};

export type AllScheduledPostsResponse = {
  scheduled_posts: ScheduledPostWithFlyerRead[];
};

export type ScheduledPostsSort =
  | "scheduled_at_desc"
  | "scheduled_at_asc"
  | "status"
  | "flyer_title";

export type ScheduledPostsStatusFilter =
  | "all"
  | "pending"
  | "scheduled"
  | "posting"
  | "posted"
  | "failed";

export type ScheduledPostSlot = {
  timeslot: string;
  flyer_name: string;
  flyer_id: number;
};

export type ScheduledPostSlotsInRangeResponse = {
  slots: ScheduledPostSlot[];
};

// Carousel post types
//
// Today the carousel is posted as 2 slides: [combined image, original flyer].
// The legacy time_date / performers / location image ids are kept (nullable)
// so we can flip back to the previous 3-image workflow without an API change.
export type SelectCarouselRequest = {
  combined_image_id: number;
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
};

export type ScheduleCarouselRequest = {
  combined_image_id: number;
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
  scheduled_at: string; // ISO 8601 datetime
  caption: string | null;
  hashtags: string | null;
};

export type InstagramCarouselPostRead = {
  id: number;
  flyer_id: number;
  combined_image_id: number | null;
  time_date_image_id: number | null;
  performers_image_id: number | null;
  location_image_id: number | null;
  post_status: PostStatus;
  instagram_post_id: string | null;
  post_error: string | null;
  caption: string | null;
  hashtags: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SelectCarouselResponse = {
  flyer_id: number;
  carousel_post: InstagramCarouselPostRead;
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

  getScheduledPosts: (params?: {
    skip?: number;
    limit?: number;
    status?: ScheduledPostsStatusFilter;
    sort?: ScheduledPostsSort;
  }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    if (params?.sort) q.set("sort", params.sort);
    const queryString = q.toString();
    return apiClient.get<ScheduledPostsResponse>(
      `/instagram/scheduled${queryString ? `?${queryString}` : ""}`
    );
  },

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

  getAllScheduledPosts: (params?: {
    skip?: number;
    limit?: number;
    status?: ScheduledPostsStatusFilter;
    sort?: ScheduledPostsSort;
  }) => instagramApi.getScheduledPosts(params),

  getScheduledSlotsInRange: (startIso: string, endIso: string) => {
    const q = new URLSearchParams({ start: startIso, end: endIso });
    return apiClient.get<ScheduledPostSlotsInRangeResponse>(
      `/instagram/scheduled-slots?${q.toString()}`
    );
  },

  // Carousel post methods
  selectCarousel: (flyerId: number, data: SelectCarouselRequest) =>
    apiClient.post<SelectCarouselResponse>(
      `/flyers/${flyerId}/instagram/select-carousel`,
      data
    ),

  scheduleCarousel: (flyerId: number, data: ScheduleCarouselRequest) =>
    apiClient.post<InstagramCarouselPostRead>(
      `/flyers/${flyerId}/instagram/schedule-carousel`,
      data
    ),

  getCarousel: (flyerId: number) =>
    apiClient.get<InstagramCarouselPostRead>(
      `/flyers/${flyerId}/instagram/carousel`
    ),

  cancelCarousel: (flyerId: number) =>
    apiClient.del(`/flyers/${flyerId}/instagram/carousel`),

  rescheduleFailedCarousel: (flyerId: number) =>
    apiClient.del(`/flyers/${flyerId}/instagram/carousel/reschedule`),
};

