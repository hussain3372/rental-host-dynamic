import { apiClient } from "../core/client";
import { ApiResponse } from "../core/client";
import { SearchResponse } from "./types";

export const propertyAPI = {
  getCertifiedProperties: async (): Promise<ApiResponse<SearchResponse>> => {
    return apiClient.get<SearchResponse>("/search/advanced", {
      headers: { "Content-Type": "application/json" },
      requiresAuth: false,
    });
  },
};

