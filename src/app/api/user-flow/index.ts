import { apiClient } from "../core/client";
import { ApiResponse } from "../core/client";
import { SearchResponse, SearchParams } from "./types";

export const propertyAPI = {
  getCertifiedProperties: async (params?: SearchParams): Promise<ApiResponse<SearchResponse>> => {
    return apiClient.get<SearchResponse>("/search/advanced", {
      headers: { "Content-Type": "application/json" },
      requiresAuth: false,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },
};