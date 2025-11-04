import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { CertificationResponse, CertificationData , ApiParams } from "./types";

const getToken = () => Cookies.get("accessToken");

export const certifications = {
    getCertifications: async (
    params?: ApiParams
  ): Promise<ApiResponse<CertificationResponse>> => {
    const token = Cookies.get("accessToken");
    
    // Clean up params - remove undefined values
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = value;
        }
      });
    }

    return apiClient.get<CertificationResponse>("/certifications", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: cleanParams,
    });
  },

  getCertificationById: async (
    id: string
  ): Promise<ApiResponse<CertificationData>> => {
    const token = getToken();
    return apiClient.get<CertificationData>(`/certifications/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  downloadCertificate: async (id: string): Promise<void> => {
    const token = Cookies.get("accessToken");
    const res = await apiClient.get<Blob>(`/certifications/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", `certificate-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },


};
