import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { CertificateDetailResponse, CertificateResponse } from "./types";

const token = Cookies.get("superAdminAccessToken");

export const certificateTemplate = {
  fetchCertificateTemplate: async (): Promise<
    ApiResponse<CertificateResponse>
  > => {
    return apiClient.get<CertificateResponse>("/certifications/templates", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  fetchCertificateTemplateDetail: async (
    id: string
  ): Promise<ApiResponse<CertificateDetailResponse>> => {
    return apiClient.get<CertificateDetailResponse>(
      `/certifications/templates/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  createCertificateTemplate: async (payload: {
    propertyTypeId: string;
    name: string;
    description: string;
    imageUrl: string;
    validityMonths: number;
  }): Promise<ApiResponse> => {
    return apiClient.post("/certifications/templates", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updateCertificateTemplate: async (
    id: string,
    payload: {
      propertyTypeId: string;
      name: string;
      description: string;
      imageUrl: string;
      validityMonths: number;
    }
  ): Promise<ApiResponse> => {
    return apiClient.put(`/certifications/templates/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteCertificateTemplate: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete(`/certifications/templates/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
