// HOST
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  NotificationsResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  // DeleteAllNotificationsResponse,
  MarkAllRead,
  Notification,
  NotificationParams
} from "./types";

const token = Cookies.get("accessToken") ;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const notificationsApi = {
  getNotifications: async (
      offset: number = 0, 
      limit: number = 10,
      read: boolean | undefined = undefined // New optional parameter
    ): Promise<ApiResponse<NotificationsResponse>> => {
      console.log(`📡 GET /notifications with offset: ${offset}, limit: ${limit}, read: ${read}`);
      
      // Build query parameters
      const params: NotificationParams = {
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
        params
      });
    },
  
  markAsRead: async (notificationId: string): Promise<ApiResponse<Notification>> => {
   return apiClient.put<Notification>(`/notifications/${notificationId}/read`, {
     headers: getAuthHeaders(),
   });
 },

 markAllAsRead: async (notificationIds: string[]): Promise<ApiResponse<MarkAllAsReadResponse>> => {
  const payload: MarkAllRead = { notificationIds };
  return apiClient.put<MarkAllAsReadResponse>("notifications/read-multiple", payload, {
    headers: getAuthHeaders(),
  });
},

  // markAllAsUnread: async (): Promise<ApiResponse<MarkAllAsReadResponse>> => {
  //   return apiClient.post<MarkAllAsReadResponse>("/notifications/mark-all-unread", {}, {
  //     headers: getAuthHeaders(),
  //   });
  // },

  deleteNotification: async (notificationId: string): Promise<ApiResponse<DeleteNotificationResponse>> => {
    return apiClient.delete<DeleteNotificationResponse>(`/notifications/${notificationId}`, {
            headers: getAuthHeaders(),

    });
  },

  // deleteAllNotifications: async (): Promise<ApiResponse<DeleteAllNotificationsResponse>> => {
  //   return apiClient.delete<DeleteAllNotificationsResponse>("/notifications", {
  //     headers: getAuthHeaders(),
  //   });
  // },
};