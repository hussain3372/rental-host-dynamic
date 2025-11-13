import { apiClient } from "../core/client";
import { ApiResponse } from "../core/client";
import { SearchResponse, SearchParams, PropertyResponse, Property, CertificationData } from "./types";

export const propertyAPI = {
  /**
   * Get certified properties with advanced search and filtering
   */
  getCertifiedProperties: async (params?: SearchParams): Promise<ApiResponse<SearchResponse>> => {
    return apiClient.get<SearchResponse>("/search/advanced", {
      headers: { "Content-Type": "application/json" },
      requiresAuth: false,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Search properties by keyword (simple search)
   */
  // Fixed searchProperties method - use 'search' parameter
searchProperties: async (params: {
  q?: string;
  location?: string;
  status?: string;
  expiresAtFilter?: string;
} = {}): Promise<ApiResponse<SearchResponse>> => {
  
  const cleanParams: Record<string, string> = {};
  
  // Only add search if it has 3+ characters
  if (params?.q && params.q.trim().length >= 3) {
    cleanParams.q = params.q.trim();
  }
  
  if (params?.location && params.location !== "All Locations") {
    cleanParams.location = params.location;
  }
  
  if (params?.status && params.status !== "Status") {
    cleanParams.status = params.status.toUpperCase();
  }
  
  if (params?.expiresAtFilter) {
    cleanParams.expiresAt = params.expiresAtFilter;
  }

  return apiClient.get<SearchResponse>("/search/advanced", {
    headers: { "Content-Type": "application/json" },
    requiresAuth: false,
    params: cleanParams,
  });
},

  /**
   * Get a single property by ID
   */
  getPropertyById: async (propertyId: string): Promise<ApiResponse<Property>> => {
    return apiClient.get<Property>(`/search/properties/${propertyId}`, {
      headers: { "Content-Type": "application/json" },
      requiresAuth: false,
    });
  },

  /**
   * Get property by certification ID (alternative endpoint if needed)
   */
  getPropertyByCertificationId: async (certificationId: string): Promise<ApiResponse<PropertyResponse>> => {
    return apiClient.get<PropertyResponse>(`/search/properties/${certificationId}`, {
      headers: { "Content-Type": "application/json" },
      requiresAuth: false,
    });
  },
  getCertificationByQrCode: async (
    qrCodeData: string
  ): Promise<ApiResponse<CertificationData>> => {
    return apiClient.get<CertificationData>(
      `/certifications/verify/${qrCodeData}`,
      {
        headers: { "Content-Type": "application/json" },
        requiresAuth: false, // ✅ Public access
      }
    );
  },
};