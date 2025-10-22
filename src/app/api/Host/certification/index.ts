import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { CertificationResponse, CertificationData } from "./types";

const getToken = () => Cookies.get("accessToken");

export const certifications = {
  getCertifications: async (
    params?: Partial<{
      propertyName: string;
      status: string;
      expiryDate: string;
      search: string;
      page: number;
      pageSize: number;
    }>
  ): Promise<ApiResponse<CertificationResponse>> => {
    const token = Cookies.get("accessToken");
    return apiClient.get<CertificationResponse>("/certifications", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params as Record<string, string | number | boolean | undefined>,
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
