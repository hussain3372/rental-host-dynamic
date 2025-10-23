// ADMIN - DEBUG VERSION
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  NotificationsResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  MarkAllRead,
  Notification
} from "./types";

const getAuthHeaders = () => {
  const token = Cookies.get("superAdminAccessToken");
  console.log("🔑 Token check:", {
    exists: !!token,
    length: token?.length,
    preview: token?.substring(0, 30) + "..."
  });
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const notificationsApi = {
  getNotifications: async (): Promise<ApiResponse<NotificationsResponse>> => {
    console.log("📡 GET /notifications");
    return apiClient.get<NotificationsResponse>("/notifications", {
      headers: getAuthHeaders(),
      requiresAuth: false,
    });
  },
  
  markAsRead: async (notificationId: string): Promise<ApiResponse<Notification>> => {
    const headers = getAuthHeaders();
    console.log("📝 PUT request details:", {
      url: `/notifications/${notificationId}/read`,
      headers: headers,
      body: {},
      notificationId
    });
    
    try {
      const response = await apiClient.put<Notification>(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: headers,
          requiresAuth: false,
        }
      );
      console.log("✅ markAsRead response:", response);
      return response;
    } catch (error) {
      console.error("❌ markAsRead error:", error);
      throw error;
    }
  },

  markAllAsRead: async (notificationIds: string[]): Promise<ApiResponse<MarkAllAsReadResponse>> => {
    const payload: MarkAllRead = { notificationIds };
    console.log("📝 PUT /notifications/read-multiple", payload);
    
    return apiClient.put<MarkAllAsReadResponse>(
      "/notifications/read-multiple",
      payload,
      {
        headers: getAuthHeaders(),
        requiresAuth: false,
      }
    );
  },

  deleteNotification: async (notificationId: string): Promise<ApiResponse<DeleteNotificationResponse>> => {
    const headers = getAuthHeaders();
    console.log("🗑️ DELETE request details:", {
      url: `/notifications/${notificationId}`,
      headers: headers,
      notificationId
    });
    
    try {
      const response = await apiClient.delete<DeleteNotificationResponse>(
        `/notifications/${notificationId}`,
        {
          headers: headers,
          requiresAuth: false,
        }
      );
      console.log("✅ delete response:", response);
      return response;
    } catch (error) {
      console.error("❌ delete error:", error);
      throw error;
    }
  },
};