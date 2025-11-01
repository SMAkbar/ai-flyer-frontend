import { apiClient } from "./client";

export type FlyerRead = {
  id: number;
  title: string;
  description: string | null;
  cloudfront_url: string;
  s3_key: string;
  created_at: string;
};

export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";

export type FlyerInformationExtraction = {
  id: number;
  flyer_id: number;
  status: ExtractionStatus;
  event_date_time: string | null;
  location_town_city: string | null;
  event_title: string | null;
  performers_djs_soundsystems: string | null;
  venue_name: string | null;
  confidence_level: string | null;
  extracted_data_json: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type GeneratedImageType = "time_date" | "performers" | "location";

export type FlyerGeneratedImage = {
  id: number;
  flyer_id: number;
  image_type: GeneratedImageType;
  cloudfront_url: string;
  instagram_post_content: string | null;
  instagram_post_status?: "pending" | "scheduled" | "posting" | "posted" | "failed";
  instagram_post_id?: string | null;
  instagram_post_error?: string | null;
  instagram_post_caption?: string | null;
  instagram_post_hashtags?: string | null;
  is_selected_for_posting?: boolean;
  instagram_posted_at: string | null;
  instagram_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FlyerDetailRead = FlyerRead & {
  information_extraction: FlyerInformationExtraction | null;
  generated_images?: FlyerGeneratedImage[] | null;
};

export type FlyerInformationExtractionUpdate = {
  event_date_time?: string | null;
  location_town_city?: string | null;
  event_title?: string | null;
  performers_djs_soundsystems?: string | null;
  venue_name?: string | null;
};

export const flyersApi = {
  getAll: () => apiClient.get<FlyerRead[]>("/flyers/"),
  getById: (id: number) => apiClient.get<FlyerDetailRead>(`/flyers/${id}`),
  create: (formData: FormData) => apiClient.postForm<FlyerRead>("/flyers/", formData),
  getExtraction: (id: number) => apiClient.get<FlyerInformationExtraction>(`/flyers/${id}/extraction`),
  updateExtraction: (id: number, data: FlyerInformationExtractionUpdate) =>
    apiClient.patch<FlyerInformationExtraction>(`/flyers/${id}/extraction`, data),
};

