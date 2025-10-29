import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import {
  ApplicationsListResponse,
  Application,
  InfoData,
  ApiWrapperResponse,
  PropertyType,
  ApplicationFilters,
  PropertyTypeApiResponse,
  ApplicationStats,
  UsersResponse,
} from "./types";
import Cookies from "js-cookie";

const getToken = () => Cookies.get("superAdminAccessToken");

export const application = {
  // Get applications with filters
  getApplication: async (
    filters?: ApplicationFilters
  ): Promise<ApiResponse<ApplicationsListResponse>> => {
    const token = getToken();

    // Clean up filters - remove empty values
    const cleanFilters: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanFilters[key] = String(value);
        }
      });
    }

    const response = await apiClient.get<ApiWrapperResponse>("/applications", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: cleanFilters,
    });

    if (!response.success) {
      return response as unknown as ApiResponse<ApplicationsListResponse>;
    }

    // Format response data
    const apiData = response.data as ApiWrapperResponse;

    const formattedData: ApplicationsListResponse = {
      applications: apiData.data?.applications || [],
      pagination: apiData.data?.pagination || {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 0,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    return {
      ...response,
      data: formattedData,
    };
  },

  // Get single application details
  getApplicationDetail: async (
    id: string
  ): Promise<ApiResponse<Application>> => {
    const token = getToken();
    const response = await apiClient.get<Application>(`/applications/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      ...response,
      data: response.data as Application,
    };
  },

  // Delete application
  deleteApplication: async (id: string): Promise<ApiResponse> => {
    const token = getToken();
    return apiClient.delete(`/applications/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get property type
  getPropertyType: async (id: string): Promise<ApiResponse<PropertyType>> => {
    const token = getToken();
    const response = await apiClient.get<PropertyTypeApiResponse>(
      `/property-types/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.success) {
      return response as unknown as ApiResponse<PropertyType>;
    }

    const propertyData = response.data as PropertyTypeApiResponse;

    return {
      ...response,
      data: propertyData.data,
    };
  },

  // Approve or reject application
  approveORrejectApplication: async (
    id: string,
    status: string
  ): Promise<ApiResponse> => {
    const token = getToken();
    return apiClient.post(`/applications/${id}/${status}`, undefined, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Request more information
  requestMoreInfo: async (id: string): Promise<ApiResponse<InfoData>> => {
    const token = getToken();
    return apiClient.post<InfoData>(
      `/applications/${id}/request-more-info`,
      undefined,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Get all applications for filter options
  getAllApplicationsForFilters: async (): Promise<
    ApiResponse<ApplicationsListResponse>
  > => {
    const token = getToken();

    const response = await apiClient.get<ApiWrapperResponse>("/applications", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: 1,
        pageSize: 1000, // Get large number for filter options
      },
    });

    if (!response.success) {
      return response as unknown as ApiResponse<ApplicationsListResponse>;
    }

    const apiData = response.data as ApiWrapperResponse;

    const formattedData: ApplicationsListResponse = {
      applications: apiData.data?.applications || [],
      pagination: apiData.data?.pagination || {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 0,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    return {
      ...response,
      data: formattedData,
    };
  },

  getApplicationStats: async (): Promise<ApiResponse<ApplicationStats>> => {
    const token = getToken();

    const response = await apiClient.get<ApplicationStats>(
      "/admin/system-stats",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  },

  getAdmins: async (): Promise<ApiResponse<UsersResponse>> => {
    const url = `/super-admin/admins`;
    const token = getToken();
    return apiClient.get<UsersResponse>(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      requiresAuth: false,
    });
  },

    assignAdmin: async (
    applicationId: string,
    adminId: string // Changed from number to string since your Admin interface uses string
  ): Promise<ApiResponse<UsersResponse>> => {
    const url = `/admin/reviews/${applicationId}/assign/${adminId}`;
    const token = getToken();
    
    // Fixed: Added empty body object and proper headers configuration
    return apiClient.post<UsersResponse>(
      url, 
      {}, // Empty body since it's not needed for this endpoint
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        requiresAuth: false,
      }
    );
  },
};
