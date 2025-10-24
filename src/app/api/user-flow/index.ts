import { apiClient } from "../core/client";
import { ApiResponse } from "../core/client";
import { SearchResponse, SearchParams, PropertyResponse, Property } from "./types";

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
  searchProperties: async (search: string, params?: SearchParams): Promise<ApiResponse<SearchResponse>> => {
    const requestParams: Record<string, string | number | boolean | undefined> = {
      search,
    };
    
    // Add other params if they exist, excluding search from params to avoid conflicts
    if (params) {
      const { search: _, ...otherParams } = params;
      Object.assign(requestParams, otherParams);
    }
    
    return apiClient.get<SearchResponse>("/search/properties", {
      headers: { "Content-Type": "application/json" },
      requiresAuth: false,
      params: requestParams,
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
};