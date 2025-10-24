import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { UsersResponse, AddAdminPayload, AddAdminResponse } from "./types";

const getAuthHeaders = () => {
  const token = Cookies.get("superAdminAccessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface GetUsersParams {
  search?: string;
  status?: string;
  maxListedProperties?: number;
  minListedProperties?: number;
  page?: number;
  limit?: number;
}

export const managementApi = {
  getUsers: async (params?: GetUsersParams): Promise<ApiResponse<UsersResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.maxListedProperties) queryParams.append('maxListedProperties', params.maxListedProperties.toString());
    if (params?.minListedProperties) queryParams.append('minListedProperties', params.minListedProperties.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/super-admin/users${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<UsersResponse>(url, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  getAdmins: async (params?: GetUsersParams): Promise<ApiResponse<UsersResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.maxListedProperties) queryParams.append('maxListedProperties', params.maxListedProperties.toString());
    if (params?.minListedProperties) queryParams.append('minListedProperties', params.minListedProperties.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/super-admin/admins${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<UsersResponse>(url, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/super-admin/users/${userId}`, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  deleteAdmin: async (adminId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/super-admin/admins/${adminId}`, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  addAdmin: async (payload: AddAdminPayload): Promise<ApiResponse<AddAdminResponse>> => {
    return apiClient.post<AddAdminResponse>(`/super-admin/admins`, payload, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },
};