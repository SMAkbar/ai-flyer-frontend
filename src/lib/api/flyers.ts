import { apiClient } from "./client";
import type { PostStatus } from "./instagram";

export type FlyerRead = {
  id: number;
  title: string;
  description: string | null;
  cloudfront_url: string;
  s3_key: string;
  created_at: string;
  extraction_status?: ExtractionStatus | null;
  carousel_post_status?: PostStatus | null;
};

export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";

export type FlyerInformationExtraction = {
  id: number;
  flyer_id: number;
  status: ExtractionStatus;
  event_date: string | null;
  location_town_city: string | null;
  event_title: string | null;
  performers_djs_soundsystems: string | null;
  venue_name: string | null;
  confidence_level: string | null; // DEPRECATED: Use field_confidence_levels
  field_confidence_levels: Record<string, string | null> | null; // Per-field confidence levels
  extracted_data_json: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type GeneratedImageType = "time_date" | "performers" | "location";

export type ImageGenerationStatus = "requested" | "generating" | "generated" | "failed";

export type FlyerGeneratedImage = {
  id: number;
  flyer_id: number;
  image_type: GeneratedImageType;
  cloudfront_url: string | null;  // Nullable until image is generated
  generation_status: ImageGenerationStatus;
  generation_error: string | null;
  created_at: string;
  updated_at: string;
};

export type FlyerDetailRead = FlyerRead & {
  information_extraction: FlyerInformationExtraction | null;
  generated_images?: FlyerGeneratedImage[] | null;
};

export type FlyerInformationExtractionUpdate = {
  event_date?: string | null;
  location_town_city?: string | null;
  event_title?: string | null;
  performers_djs_soundsystems?: string | null;
  venue_name?: string | null;
};

export type BulkFlyerCreateResponse = {
  batch_id: number;
  flyers: FlyerRead[];
  message: string;
};

export const flyersApi = {
  getAll: () => apiClient.get<FlyerRead[]>("/flyers"), // Returns FlyerRead with extraction_status and carousel_post_status
  getById: (id: number) => apiClient.get<FlyerDetailRead>(`/flyers/${id}`),
  create: (formData: FormData) => apiClient.postForm<FlyerRead>("/flyers", formData),
  createBulk: (formData: FormData) => apiClient.postForm<BulkFlyerCreateResponse>("/flyers/bulk", formData),
  getExtraction: (id: number) => apiClient.get<FlyerInformationExtraction>(`/flyers/${id}/extraction`),
  updateExtraction: (id: number, data: FlyerInformationExtractionUpdate) =>
    apiClient.patch<FlyerInformationExtraction>(`/flyers/${id}/extraction`, data),
  generateImages: (id: number) =>
    apiClient.post<{ message: string }>(`/flyers/${id}/generate-images`, {}),
};

