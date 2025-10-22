import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { ProfileResponse, UpdateProfile } from "./types";

const token = Cookies.get("adminAccessToken");

export const profile = {
  fetchProfileData: async (): Promise<ApiResponse<ProfileResponse>> => {
    return apiClient.get<ProfileResponse>("/profile", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updateProfileData: async (
    payload: UpdateProfile
  ): Promise<ApiResponse<UpdateProfile>> => {
    return apiClient.put<UpdateProfile>("/profile", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
