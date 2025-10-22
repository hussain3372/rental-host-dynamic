// api/Admin/search/index.ts
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { TemplatesPayload } from "./type";

const getAuthHeaders = () => {
  const token = Cookies.get("adminAccessToken"); 
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const searchApi = {
  getSearchResults: async (searchQuery: string): Promise<ApiResponse<TemplatesPayload>> => {
    return apiClient.get(`/admin/search?search=${encodeURIComponent(searchQuery)}`, {
      headers: getAuthHeaders(),
    });
  },
};