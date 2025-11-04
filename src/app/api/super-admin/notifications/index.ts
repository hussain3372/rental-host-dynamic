import { apiClient, ApiResponse } from "../../core/client";
import { AxiosRequestConfig } from 'axios';

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

interface GetNotificationsParams {
  offset: number;
  limit: number;
  read?: string;
}

export const notificationsApi = {
  getNotifications: async (
    offset: number = 0, 
    limit: number = 10,
    read: boolean | undefined = undefined
  ): Promise<ApiResponse<NotificationsResponse>> => {
    console.log(`📡 GET /notifications with offset: ${offset}, limit: ${limit}, read: ${read}`);
    
    // Build query parameters with proper typing
    const params: GetNotificationsParams = {
      offset,
      limit
    };
    
    // Add read status parameter if provided
    if (read !== undefined) {
      params.read = read.toString();
    }
    
    return apiClient.get<NotificationsResponse>("/notifications", {
      headers: getAuthHeaders(),
      requiresAuth: false,
      params : params as AxiosRequestConfig['params']
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