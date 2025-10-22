// notifications/types.ts
export interface ApiNotification {
  id: string;
  userId: number;
  type: string;
  title: string;
  message: string;
  data: {
    step?: string;
    status: string;
    applicationId: string;
  };
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  total: number;
  unreadCount: number;
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface MarkAllAsReadResponse {
  updatedCount: number;
}

export interface DeleteNotificationResponse {
  success : boolean
  data : string
  message :  string
}

export interface DeleteAllNotificationsResponse  {
  deletedCount: number;
}
export interface MarkAllRead {
  notificationIds: string[];
}
export interface MarkAllRead {
  notificationIds: string[];
}

export interface Notification {
  id: string;
  userId: number;
  type: "APPLICATION_STATUS";
  title: string;
  message: string;
  data: {
    step: "PROPERTY_DETAILS";
    status: "DRAFT";
    applicationId: string;
  };
  read: boolean;
  readAt: string;
  createdAt: string;
}