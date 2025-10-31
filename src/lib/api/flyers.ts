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

export type FlyerDetailRead = FlyerRead & {
  information_extraction: FlyerInformationExtraction | null;
};

export const flyersApi = {
  getAll: () => apiClient.get<FlyerRead[]>("/flyers/"),
  getById: (id: number) => apiClient.get<FlyerDetailRead>(`/flyers/${id}`),
  create: (formData: FormData) => apiClient.postForm<FlyerRead>("/flyers/", formData),
  getExtraction: (id: number) => apiClient.get<FlyerInformationExtraction>(`/flyers/${id}/extraction`),
};

