import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { PropertyResponse } from "./types";

const token = Cookies.get("superAdminAccessToken");

export const property = {
  fetchPropertyData: async (): Promise<ApiResponse<PropertyResponse>> => {
    return apiClient.get<PropertyResponse>("/property-types", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createPropertyData: async (payload: {
    name: string;
    description: string;
    defaultChecklist: { name: string }[];
  }): Promise<ApiResponse<PropertyResponse>> => {
    return apiClient.post<PropertyResponse>("/property-types", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updatePropertyType: async (
    id: string,
    payload: {
      name: string;
      description: string;
      defaultChecklist: { name: string }[];
    }
  ): Promise<ApiResponse<PropertyResponse>> => {
    return apiClient.put<PropertyResponse>(`/property-types/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deletePropertyType: async (
    id: string
  ): Promise<ApiResponse<PropertyResponse>> => {
    return apiClient.delete<PropertyResponse>(`/property-types/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteChecklist: async (checklistid: string): Promise<ApiResponse> => {
    return apiClient.delete(`/checklists/${checklistid}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
