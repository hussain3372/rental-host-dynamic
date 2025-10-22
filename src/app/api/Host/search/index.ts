// api/Host/search/index.ts
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { TemplatesPayload } from "./type";

const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const searchApi = {
  // Accept query string
  getSearchResults: async (searchQuery: string): Promise<ApiResponse<TemplatesPayload>> => {
    return apiClient.get(`/host/search?search=${encodeURIComponent(searchQuery)}`, {
      headers: getAuthHeaders(),
    });
  },
};
