import { apiClient } from "./client";
import type { Result } from "./client";
import type { PostStatus } from "./instagram";

export type FlyerRead = {
  id: number;
  title: string;
  description: string | null;
  cloudfront_url: string;
  s3_key: string;
  flyer_hash?: string | null;
  created_at: string;
  event_date?: string | null;
  extraction_status?: ExtractionStatus | null;
  carousel_post_status?: PostStatus | null;
};

export type FlyerImageHashCheckResponse = {
  flyer_hash: string;
  is_duplicate: boolean;
  existing_flyer: { id: number; title: string } | null;
};

export type FlyerBulkHashCheckResponse = {
  has_duplicates: boolean;
  matches_in_db: Array<{
    flyer_hash: string;
    filenames: string[];
    existing_flyer_id: number;
    existing_flyer_title: string | null;
    existing_flyer_user_id: number | null;
  }>;
  duplicates_in_request: Array<{
    flyer_hash: string;
    filenames: string[];
  }>;
};

export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";

export type FlyerInformationExtraction = {
  id: number;
  flyer_id: number;
  status: ExtractionStatus;
  event_date: string | null; // ISO date string (YYYY-MM-DD format)
  location_town_city: string | null;
  country: string | null; // Country name (e.g., "United Kingdom", "Germany")
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
  cloudfront_url: string | null; // Nullable until image is generated
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
  event_date?: string | null; // ISO date string (YYYY-MM-DD format)
  location_town_city?: string | null;
  country?: string | null; // Country name (e.g., "United Kingdom", "Germany")
  event_title?: string | null;
  performers_djs_soundsystems?: string | null;
  venue_name?: string | null;
};

export type BulkFlyerCreateResponse = {
  batch_id: number;
  flyers: FlyerRead[];
  message: string;
};

/** Page size for GET /flyers (matches backend default). */
export const FLYERS_LIST_PAGE_SIZE = 20;

export type FlyerListStatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "extracted"
  | "posted"
  | "failed";
export type FlyerListSort = "latest" | "oldest" | "latest_event" | "oldest_event";

export type FlyerListPageResponse = {
  items: FlyerRead[];
  total: number;
  extractions_active: number;
};

function flyersListPath(params: {
  skip: number;
  limit: number;
  search?: string;
  status?: FlyerListStatusFilter;
  sort?: FlyerListSort;
}): string {
  const q = new URLSearchParams();
  q.set("skip", String(params.skip));
  q.set("limit", String(params.limit));
  if (params.search && params.search.trim()) {
    q.set("search", params.search.trim());
  }
  if (params.status && params.status !== "all") {
    q.set("status", params.status);
  }
  if (params.sort && params.sort !== "latest") {
    q.set("sort", params.sort);
  }
  return `/flyers?${q.toString()}`;
}

export const flyersApi = {
  getPage: (params: {
    skip: number;
    limit: number;
    search?: string;
    status?: FlyerListStatusFilter;
    sort?: FlyerListSort;
  }) =>
    apiClient.get<FlyerListPageResponse>(flyersListPath(params)),
  getAll: async (): Promise<Result<FlyerRead[]>> => {
    const r = await apiClient.get<FlyerListPageResponse>(flyersListPath({ skip: 0, limit: 100 }));
    if (!r.ok) return r;
    return { ok: true, data: r.data.items };
  },
  getById: (id: number) => apiClient.get<FlyerDetailRead>(`/flyers/${id}`),
  checkImageHash: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiClient.postForm<FlyerImageHashCheckResponse>("/flyers/check-image-hash", fd);
  },
  checkBulkImageHashes: (files: File[]) => {
    const fd = new FormData();
    files.forEach((file) => fd.append("images", file));
    return apiClient.postForm<FlyerBulkHashCheckResponse>("/flyers/check-bulk-image-hashes", fd);
  },
  create: (formData: FormData) => apiClient.postForm<FlyerRead>("/flyers", formData),
  createBulk: (formData: FormData, approveDuplicates = false) => {
    if (approveDuplicates) {
      formData.append("approve_duplicates", "true");
    }
    return apiClient.postForm<BulkFlyerCreateResponse>("/flyers/bulk", formData);
  },
  getExtraction: (id: number) => apiClient.get<FlyerInformationExtraction>(`/flyers/${id}/extraction`),
  updateExtraction: (id: number, data: FlyerInformationExtractionUpdate) =>
    apiClient.patch<FlyerInformationExtraction>(`/flyers/${id}/extraction`, data),
  generateImages: (id: number) =>
    apiClient.post<{ message: string }>(`/flyers/${id}/generate-images`, {}),
  retryExtraction: (id: number) =>
    apiClient.post<{ message: string }>(`/flyers/${id}/retry-extraction`, {}),
  archive: (id: number) => apiClient.post<void>(`/flyers/${id}/archive`, {}),
  delete: (id: number) => apiClient.del<void>(`/flyers/${id}`),
};
