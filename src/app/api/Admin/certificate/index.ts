// api/certificateApi.ts
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { CertificationResponse, Certification , CertificateFilters } from "./types";

const token = Cookies.get("adminAccessToken");
const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


interface DeleteCertificatesPayload {
  certificationIds: string[];
}

export const certificateApi = {
  getCertificates: async (filters?: CertificateFilters): Promise<ApiResponse<CertificationResponse>> => {
    // Build query parameters - include all defined values
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

  deleteCertificate: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/certificates/${id}/delete`, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  deleteCertificates: async (certificationIds: string[]): Promise<ApiResponse<void>> => {
    const payload: DeleteCertificatesPayload = {
      certificationIds,
    };
    
    return apiClient.delete<void>('/certificate/delete', {
      headers: getAuthHeaders(),
      requiresAuth: false,
      body: JSON.stringify(payload),
    });
  },

    updateCertificateStatus: async (id: string, action:  'revoke' | 'active' | 'expire'): Promise<ApiResponse<Certification>> => {
      return apiClient.post<Certification>(`/certifications/${id}/${action}`,undefined, {
        headers: getAuthHeaders(),
        requiresAuth: false,
      });
    },
};