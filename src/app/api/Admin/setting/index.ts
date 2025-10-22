import { apiClient, ApiResponse } from "../../core/client";
import { SettingData, TwoFactorAuth ,ChangePasswordResponse , PaymentResponse } from "./types";
import Cookies from "js-cookie";

const token = Cookies.get("adminAccessToken");

export const setting = {
  getSetting: async (): Promise<ApiResponse<SettingData>> => {
    return apiClient.get<SettingData>("/settings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  changeStatus: async (
    payload: FormData
  ): Promise<ApiResponse<SettingData>> => {
    console.log(`payload ${payload}`);

    return apiClient.post<SettingData>("/settings", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  changetwoFactorAuth: async (payload: {
    mfaEnabled: boolean;
  }): Promise<ApiResponse<TwoFactorAuth>> => {
    console.log("payload", payload);

    return apiClient.put<TwoFactorAuth>("/twofa/status", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  changePassword: async (
    payload: { currentPassword: string; newPassword: string }
  ): Promise<ApiResponse<ChangePasswordResponse>> => {
    return apiClient.put<ChangePasswordResponse>(
      "/auth/change-password",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    },

     // In your settings/index.ts file, add this function:

getBillingWithParams: async (params: {
  status?: string;
  skip?: number;
  take?: number;
}): Promise<ApiResponse<PaymentResponse>> => {
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params.take !== undefined) queryParams.append('take', params.take.toString());
  
  const queryString = queryParams.toString();
  const url = `/payments/my-payments${queryString ? `?${queryString}` : ''}`;
  
  console.log("Making API call to:", url);
  
  return apiClient.get<PaymentResponse>(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
},
};
