import { apiClient } from "../../core/client";
import { ApiResponse } from "../../core/client";
import { DashboardResponse } from "./types";
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
    
}