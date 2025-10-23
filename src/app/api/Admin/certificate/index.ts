// api/certificateApi.ts
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { CertificationResponse, Certification } from "./types";

const getAuthHeaders = () => {
  const token = Cookies.get("adminAccessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

interface CertificateFilters {
  issuedAt?: string;
  expiredAt?: string;
  status?: "ACTIVE" | "REVOKED" | "EXPIRED";
  take?: number;
  skip?: number;
}

export const certificateApi = {
  getCertificates: async (filters?: CertificateFilters): Promise<ApiResponse<CertificationResponse>> => {
    // Build query parameters - only include defined values
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/certifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiClient.get<CertificationResponse>(url, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  getCertificateById: async (id: string): Promise<ApiResponse<Certification>> => {
    return apiClient.get<Certification>(`/certifications/${id}`, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  // deleteCertificate: async (id: number): Promise<ApiResponse<void>> => {
  //   return apiClient.delete<void>(`/certifications/${id}`, {
  //     headers: getAuthHeaders(),
  //     requiresAuth: false,
  //   });
  // },
};