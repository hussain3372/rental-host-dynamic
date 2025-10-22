import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { ReportResponse } from "./types";

const token = Cookies.get("adminAccessToken");

export const reports = {
  getReports: async (): Promise<ApiResponse<ReportResponse>> => {
    return apiClient.get<ReportResponse>("/certifications/stats", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
}