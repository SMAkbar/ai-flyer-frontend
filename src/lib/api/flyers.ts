import { apiClient } from "./client";

export type FlyerRead = {
  id: number;
  title: string;
  description: string | null;
  cloudfront_url: string;
  s3_key: string;
  created_at: string;
};

export const flyersApi = {
  getAll: () => apiClient.get<FlyerRead[]>("/flyers/"),
  create: (formData: FormData) => apiClient.postForm<FlyerRead>("/flyers/", formData),
};

