// profile.ts
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import { ProfileResponse, UpdateProfile } from "./types";

interface ProfileImageResponse {
  data: {
    profilePicture: string;
  };
}

const token = Cookies.get("accessToken");

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

  updateProfileImage: async (file: File): Promise<ApiResponse<ProfileImageResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/profile/picture", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
