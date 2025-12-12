import { apiClient, type Result } from "./client";

// WordPress post status
export type WordPressPostStatus = "pending" | "scheduled" | "posting" | "posted" | "failed";

// WordPress post read type
export type WordPressPostRead = {
  id: number;
  flyer_id: number;
  scheduled_at: string | null;
  posted_at: string | null;
  is_selected_for_posting: boolean;
  post_status: WordPressPostStatus;
  post_error: string | null;
  wp_event_id: string | null;
  wp_event_url: string | null;
  wp_media_id: number | null;
  created_at: string;
  updated_at: string;
};

// WordPress post schedule request
export type WordPressPostScheduleRequest = {
  scheduled_at: string;
};

export const wordpressApi = {
  /**
   * Get WordPress post status for a flyer.
   */
  getPost: (flyerId: number): Promise<Result<WordPressPostRead | null>> => {
    return apiClient.get<WordPressPostRead | null>(`/flyers/${flyerId}/wordpress`);
  },

  /**
   * Schedule a WordPress post for a flyer.
   */
  schedulePost: (
    flyerId: number,
    data: WordPressPostScheduleRequest
  ): Promise<Result<WordPressPostRead>> => {
    return apiClient.post<WordPressPostRead>(`/flyers/${flyerId}/wordpress/schedule`, data);
  },

  /**
   * Post a flyer to WordPress immediately.
   */
  postNow: (flyerId: number): Promise<Result<WordPressPostRead>> => {
    return apiClient.post<WordPressPostRead>(`/flyers/${flyerId}/wordpress/post-now`, {});
  },

  /**
   * Cancel a scheduled WordPress post.
   */
  cancelPost: (flyerId: number): Promise<Result<void>> => {
    return apiClient.del(`/flyers/${flyerId}/wordpress`);
  },

  /**
   * Get all scheduled WordPress posts for the current user.
   */
  getAllScheduledPosts: (): Promise<Result<WordPressPostRead[]>> => {
    return apiClient.get<WordPressPostRead[]>("/wordpress/scheduled");
  },
};

