// HOST
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  NotificationsResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  // DeleteAllNotificationsResponse,
  MarkAllRead,
  Notification
} from "./types";

const token = Cookies.get("accessToken") ;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const notificationsApi = {
  getNotifications: async (): Promise<ApiResponse<NotificationsResponse>> => {
    return apiClient.get<NotificationsResponse>("/notifications", {
      headers: getAuthHeaders(),
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