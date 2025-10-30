import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { UsersResponse, AddAdminPayload, AddAdminResponse , GetUsersParams , UserDetail , PropertyResponse , GetUserPropertiesParams , BillingHistoryResponse , GetUserBillingParams,PropertyType,PropertyTypeApiResponse , Application , AdminData,ApplicationsResponse,GetAdminReviewedApplicationsParams,UpdateUserPayload,UpdateAdminPayload,UpdateAdminResponse,UpdateUserResponse} from "./types";

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

       getPropertyType: async (id: string): Promise<ApiResponse<PropertyType>> => {
          const res = await apiClient.get<PropertyTypeApiResponse>(`/property-types/${id}`, {
           headers: getAuthHeaders(),
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

        getApplicationDetail: async (
            id: string
          ): Promise<ApiResponse<Application>> => {
            const res = await apiClient.get<Application>(`/applications/${id}`, {
               headers: getAuthHeaders(),
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

          approveORrejectApplication: async (
              id: string,
              status: string
            ): Promise<ApiResponse> => {

              return apiClient.post(`/applications/${id}/${status}`, undefined, {
                headers: getAuthHeaders(),
              });
            },

            getAdminDetail: async (id : string): Promise<ApiResponse<AdminData>> => {
            return apiClient.get<AdminData>(`/super-admin/admins/${id}`, {
              headers: getAuthHeaders(),
              requiresAuth: false,
    });
  },

 getAdminReviewedApplications: async (adminId: number, params?: GetAdminReviewedApplicationsParams): Promise<ApiResponse<ApplicationsResponse>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.reviewedFrom) queryParams.append('reviewedFrom', params.reviewedFrom);
  if (params?.reviewedTo) queryParams.append('reviewedTo', params.reviewedTo);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/super-admin/admins/${adminId}/reviewed-applications${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get<ApplicationsResponse>(url, {
    headers: getAuthHeaders(),
    requiresAuth: false,
  });
},

   updateUser: async (userId: number, payload: UpdateUserPayload): Promise<ApiResponse<UpdateUserResponse>> => {
    try {
      return await apiClient.put<UpdateUserResponse>(`/super-admin/users/${userId}`, payload, {
        headers: getAuthHeaders(),
        requiresAuth: false,
      });
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      throw new Error( 'Failed to update user');
    }
  },

  // UPDATE ADMIN API
  updateAdmin: async (adminId: number, payload: UpdateAdminPayload): Promise<ApiResponse<UpdateAdminResponse>> => {
    try {
      return await apiClient.put<UpdateAdminResponse>(`/super-admin/admins/${adminId}`, payload, {
        headers: getAuthHeaders(),
        requiresAuth: false,
      });
    } catch (error: unknown) {
      console.error('Error updating admin:', error);
      throw new Error( 'Failed to update admin');
    }
  },


};