import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  RevenueResponse,
  DashboardStatsResponse,
  RevenueInsightsResponse,
  PropertyInsightsResponse
} from "./types";

const getAuthHeaders = () => {
  const token = Cookies.get("superAdminAccessToken");
  console.log("🔑 Token check:", {
    exists: !!token,
    length: token?.length,
    preview: token?.substring(0, 30) + "..."
  });
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const dashboardApi = {
  getRevenue: async (): Promise<ApiResponse<RevenueResponse>> => {
    return apiClient.get<RevenueResponse>("/super-admin/dashboard/revenue", {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  getStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return apiClient.get<DashboardStatsResponse>("/super-admin/dashboard/stats", {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  getRevenueInsights: async (period: string): Promise<ApiResponse<RevenueInsightsResponse>> => {
    return apiClient.get<RevenueInsightsResponse>("/super-admin/dashboard/revenue-insights", {
      headers: getAuthHeaders(),
      requiresAuth: false,
      params: { period }
    });
  },

  getPropertyInsights: async (period: string): Promise<ApiResponse<PropertyInsightsResponse>> => {
    return apiClient.get<PropertyInsightsResponse>("/super-admin/dashboard/property-insights", {
      headers: getAuthHeaders(),
      requiresAuth: false,
      params: { period }
    });
  },
}