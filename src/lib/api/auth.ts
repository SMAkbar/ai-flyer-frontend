import { apiClient } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export const authApi = {
  login: (payload: LoginRequest) => apiClient.post<TokenResponse, LoginRequest>("/auth/login", payload),
  register: (payload: { email: string; password: string; full_name?: string }) =>
    apiClient.post("/auth/register", payload),
};


