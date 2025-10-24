import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import { DashboardResponse , GraphResponse } from "./types";
import Cookies from "js-cookie";

const token = Cookies.get('adminAccessToken')

export const dashboard = {
    
getStats: async (): Promise<ApiResponse<DashboardResponse>> =>

    apiClient.get<DashboardResponse>("/admin/dashboard",

        {
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        }
    ),

getDashboard: async (period: "weekly" | "monthly" | "yearly" = "yearly"): Promise<ApiResponse<GraphResponse>> =>

    apiClient.get<GraphResponse>("/admin/applications/data",
        {
            params: {
                period: period
            },
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        }
    ),
    
}