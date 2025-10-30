import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { PaymentStatsResponse } from "./types";

const token = Cookies.get("superAdminAccessToken");

export const payment = {
  paymentStats: async (): Promise<ApiResponse<PaymentStatsResponse>> => {
    return apiClient.get<PaymentStatsResponse>("/payments/admin/stats", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getBillingWithParams: async (params: {
    status?: string;
    skip?: number;
    take?: number;
  }): Promise<ApiResponse<PaymentResponse>> => {
    
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append("status", params.status);
    if (params.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params.take !== undefined)
      queryParams.append("take", params.take.toString());

    const queryString = queryParams.toString();
    const url = `/payments/my-payments${queryString ? `?${queryString}` : ""}`;

    console.log("Making API call to:", url);

    return apiClient.get<PaymentResponse>(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
