import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import { ApplicationsListResponse, Application, InfoData, ApiWrapperResponse, PropertyType } from "./types";
import Cookies from "js-cookie";

const getToken = () => Cookies.get("adminAccessToken");
interface PropertyTypeApiResponse {
  message: string;
  data: PropertyType;
}
export const application = {
  getApplication: async (
    params?: Partial<{
      ownership: string;
      status: string;
      submittedAt: string;
      currentStep: string;
      page: number;
      pageSize: number;
      search: string;
    }>
  ): Promise<ApiResponse<ApplicationsListResponse>> => {
    const token = getToken();

    const res = await apiClient.get<ApiWrapperResponse>("/applications", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params as Record<string, string | number | boolean | undefined>,
    });


    if (!res.success) {
      return res as unknown as ApiResponse<ApplicationsListResponse>;
    }

    // Extract the nested data structure
    const wrapperData = res.data as ApiWrapperResponse;
    const applicationsData = wrapperData.data;

    const normalized: ApplicationsListResponse = {
      applications: applicationsData?.applications || [],
      pagination: applicationsData?.pagination || {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 0,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false
      }
    };

    return {
      ...res,
      data: normalized,
    } as ApiResponse<ApplicationsListResponse>;
  },
  getApplicationDetail: async (
    id: string
  ): Promise<ApiResponse<Application>> => {
    const token = getToken();
    const res = await apiClient.get<Application>(`/applications/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.success) return res as ApiResponse<Application>;
    const payload = res.data as Application;
    const normalized: Application = (payload?.id && typeof payload.id === 'string')
      ? payload as Application
      : (payload as Application);
    return {
      ...res,
      data: normalized,
    } as ApiResponse<Application>;
  },

  deleteApplication: async (id: string): Promise<ApiResponse> => {
    const token = getToken();
    return apiClient.delete(`/applications/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
  // In your application API file, add this method:

  getPropertyType: async (id: string): Promise<ApiResponse<PropertyType>> => {
    const token = getToken();
    const res = await apiClient.get<PropertyTypeApiResponse>(`/property-types/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.success) {
      return res as unknown as ApiResponse<PropertyType>;
    }

    // Extract the nested data structure from the API response
    const wrapperData = res.data as PropertyTypeApiResponse;
    const propertyTypeData = wrapperData.data;

    return {
      ...res,
      data: propertyTypeData,
    } as ApiResponse<PropertyType>;
  },

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

  requestMoreInfor: async (id: string): Promise<ApiResponse<InfoData>> => {
    const token = getToken();
    return apiClient.post<InfoData>(`/applications/${id}/request-more-info`, undefined, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};