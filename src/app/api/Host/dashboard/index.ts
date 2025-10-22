
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { DashboardStatsResponse, ApplicationTrackerResponse } from "./types";

const token = Cookies.get("accessToken");

export const dashboard = {
  fetchStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return apiClient.get<DashboardStatsResponse>("/dashboard/stats", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add this new method for application tracker
  fetchApplicationTracker: async (): Promise<ApiResponse<ApplicationTrackerResponse>> => {
    return apiClient.get<ApplicationTrackerResponse>("/dashboard/application-tracker", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};