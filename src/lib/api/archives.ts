import { apiClient } from "./client";
import type { FlyerListPageResponse } from "./flyers";

function archivesListPath(params: { skip: number; limit: number }): string {
  const q = new URLSearchParams();
  q.set("skip", String(params.skip));
  q.set("limit", String(params.limit));
  return `/flyers/archives?${q.toString()}`;
}

export const archivesApi = {
  get: (params: { skip: number; limit: number }) =>
    apiClient.get<FlyerListPageResponse>(archivesListPath(params)),
  unarchive: (id: number) => apiClient.post<void>(`/flyers/${id}/unarchive`, {}),
};
