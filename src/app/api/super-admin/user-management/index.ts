import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { UsersResponse, AddAdminPayload, AddAdminResponse , GetUsersParams , UserDetail , PropertyResponse , GetUserPropertiesParams , BillingHistoryResponse , GetUserBillingParams } from "./types";

const getAuthHeaders = () => {
  const token = Cookies.get("superAdminAccessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

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

  getUserDetail: async (id : string): Promise<ApiResponse<UserDetail>> => {
    return apiClient.get<UserDetail>(`/super-admin/users/${id}`, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

  getUserProperty: async (params?: GetUsersParams): Promise<ApiResponse<UsersResponse>> => {
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

  getUserProperties: async (
    userId: string, 
    params?: GetUserPropertiesParams
  ): Promise<ApiResponse<PropertyResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.submittedFrom) queryParams.append('submittedFrom', params.submittedFrom);
    if (params?.submittedTo) queryParams.append('submittedTo', params.submittedTo);
    if (params?.ownership) queryParams.append('ownership', params.ownership);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/super-admin/users/${userId}/properties${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PropertyResponse>(url, {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },

   getUserBilling: async (
    userId: string, 
    params?: GetUserBillingParams
  ): Promise<ApiResponse<BillingHistoryResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.endDateFrom) queryParams.append('endDateFrom', params.endDateFrom);
    if (params?.endDateTo) queryParams.append('endDateTo', params.endDateTo);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/super-admin/users/${userId}/billing${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<BillingHistoryResponse>(url, {
      headers: getAuthHeaders(),
    });
  },
    deleteApplication: async (id: string): Promise<ApiResponse> => {
        return apiClient.delete(`/applications/${id}`, {
          headers: getAuthHeaders(),
        });
      },
};