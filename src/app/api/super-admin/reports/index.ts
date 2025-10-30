import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  ReportListResponse,
  ReportDetailResponse,
  CreateReportRequest,
  CreateReportResponse,
  ReportStats,
  DeleteReport
} from "./types";

const token = Cookies.get("adminAccessToken");

export const reports = {
  getReports: async (params?: {
    search?: string;
    reportType?: "WEEKLY" | "MONTHLY" | "CUSTOM" | "ALL";
    certificationStatus?: "ALL" | "ACTIVE" | "EXPIRED" | "REVOKED";
    generatedDateTo?: string;
  }): Promise<ApiResponse<ReportListResponse>> => {
    const query = new URLSearchParams();

    // Only append valid params
    if (params?.search) query.append("search", params.search);

    // ✅ Only add reportType if it's a valid one (not empty or "ALL")
    if (params?.reportType && params.reportType !== "ALL")
      query.append("reportType", params.reportType);

    // ✅ certificationStatus is safe to send even if "ALL"
    if (params?.certificationStatus)
      query.append("certificationStatus", params.certificationStatus);

    // ✅ Add generatedDateTo only if it's a valid date
    if (params?.generatedDateTo && !isNaN(Date.parse(params.generatedDateTo)))
      query.append("generatedDateTo", params.generatedDateTo);

    return apiClient.get<ReportListResponse>(`/reports?${query.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createReport: async (
    data: CreateReportRequest
  ): Promise<ApiResponse<CreateReportResponse>> => {
    return apiClient.post<CreateReportResponse>("/reports", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getReportDetail: async (
    id: string
  ): Promise<ApiResponse<ReportDetailResponse>> => {
    return apiClient.get<ReportDetailResponse>(`/reports/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteReport: async (id: string): Promise<ApiResponse<DeleteReport>> => {
    return apiClient.delete(`/reports/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  downloadReport: async (
    id: string
  ): Promise<ApiResponse<ReportDetailResponse>> => {
    return apiClient.get(`/reports/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
  },

  reDownloadReport: async (id: string): Promise<ApiResponse<DeleteReport>> => {
    return apiClient.post(
      `/reports/${id}/re-download`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

   getReportStats: async (): Promise<ApiResponse<ReportStats>> => {
    return apiClient.get<ReportStats>(`/certifications/stats`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
