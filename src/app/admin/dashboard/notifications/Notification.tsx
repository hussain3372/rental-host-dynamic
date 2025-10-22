// ADMIN - Fixed to only update UI on API success
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { notificationsApi } from "@/app/api/Admin/notifications";
import { ApiNotification } from "@/app/api/Admin/notifications/types";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  status: "read" | "unread";
  image: string;
  highlight: boolean;
}

const formatTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const getNotificationImage = (type: string, status: string): string => {
  if (type === "APPLICATION_STATUS") {
    if (status === "SUBMITTED") return "/images/notification2.png";
    if (status === "DRAFT") return "/images/notification1.png";
  }
  return "/images/notification-default.png";
};

const transformNotifications = (apiNotifications: ApiNotification[]): Notification[] => {
  return apiNotifications.map((notif) => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    time: formatTime(notif.createdAt),
    status: notif.read ? "read" : "unread",
    image: getNotificationImage(notif.type, notif.data.status),
    highlight: !notif.read,
  }));
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [allRead, setAllRead] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications();
      if (response?.data?.notifications) {
        const transformed = transformNotifications(response.data.notifications);
        setNotifications(transformed);
        setTotalCount(response.data.total);
        setUnreadCount(response.data.unreadCount);
        setAllRead(response.data.unreadCount === 0);
      }
    } catch {
      toast.error("Failed to fetch notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Handle single notification click - Only update UI on success
  const handleNotificationClick = async (notificationId: string) => {
    if (loadingIds.has(notificationId)) return;

    const notif = notifications.find((n) => n.id === notificationId);
    if (!notif || notif.status === "read") return;

    setLoadingIds((prev) => new Set(prev).add(notificationId));

    try {
      const response = await notificationsApi.markAsRead(notificationId);
      
      // Only update UI if API call was successful
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, status: "read", highlight: false } : n
          )
        );
        setUnreadCount((prev) => {
          const newCount = Math.max(0, prev - 1);
          if (newCount === 0) setAllRead(true);
          return newCount;
        });
        toast.success("Notification marked as read.");
      } else {
        toast.error(response.message || "Failed to mark notification as read.");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read.");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  // ✅ Handle mark all as read - Only update UI on success
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    const unreadIds = notifications
      .filter(notif => notif.status === "unread")
      .map(notif => notif.id);

    if (unreadIds.length === 0) return;

    setLoadingIds(new Set(unreadIds));

    try {
      const response = await notificationsApi.markAllAsRead(unreadIds);
      
      // Only update UI if API call was successful
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "read", highlight: false })));
        setUnreadCount(0);
        setAllRead(true);
        toast.success("All notifications marked as read.");
      } else {
        toast.error(response.message || "Failed to mark all as read.");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read.");
    } finally {
      setLoadingIds(new Set());
    }
  };

  // ✅ Handle delete - Only update UI on success
  const handleDeleteNotification = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (loadingIds.has(id)) return;

    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      const response = await notificationsApi.deleteNotification(id);
      
      // Only update UI if API call was successful
      if (response && response.success) {
        const deletedNotif = notifications.find((n) => n.id === id);
        
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        
        if (deletedNotif?.status === "unread") {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        toast.success("Notification deleted.");
      } else {
        toast.error(response?.message || "Failed to delete notification.");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification. Please try again.");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredNotifications = notifications.filter(
    (n) => activeTab === "all" || n.status === activeTab
  );
  const readCount = totalCount - unreadCount;

  if (loading) {
    return (
      <div className="text-white pb-[190px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] leading-[24px] font-semibold">Notifications</h1>
        </div>
        <div className="flex justify-center items-center py-20">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="text-white pb-[190px]">
      {/* Description */}
      <p className="text-4 leading-5 text-[#FFFFFF99] font-normal mb-[40px]">
        Stay updated with your latest application and certificate activities.
      </p>

      {/* Tabs & Mark All */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {["all", "unread", "read"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm sm:text-base font-medium capitalize leading-5
                ${
                  activeTab === tab
                    ? "bg-[rgba(239,252,118,0.08)] border border-[rgba(239,252,118,0.60)] text-white"
                    : "bg-[#121315] text-gray-300"
                }`}
            >
              {tab}{" "}
              {tab === "all"
                ? `(${totalCount})`
                : tab === "unread"
                ? `(${unreadCount})`
                : `(${readCount})`}
            </button>
          ))}
        </div>

        {/* Mark all as read */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div
            className="flex items-center gap-5 px-4 py-2 rounded-md bg-[#121315] cursor-pointer max-w-[201px]"
            onClick={handleMarkAllAsRead}
          >
            <label className="relative w-[18px] h-[18px] flex items-center justify-center">
              <input
                type="checkbox"
                checked={allRead}
                readOnly
                className="appearance-none w-full h-full rounded-[4px] border border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.12)] checked:bg-[rgba(239,252,118,0.08)] checked:border-[rgba(239,252,118,0.6)]"
              />
              {allRead && (
                <svg
                  className="w-3 h-3 absolute pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </label>
            <span className="text-sm sm:text-base font-medium leading-5 text-white">
              Mark All as Read
            </span>
          </div>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              src="/images/notify-empty.png"
              alt="No Notifications"
              width={220}
              height={220}
            />
            <span className="mt-8 text-white text-[24px] leading-[28px] font-medium">
              No {activeTab} notifications available
            </span>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.id)}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#121315] border-l-2 relative group cursor-pointer transition-all hover:bg-[#1a1b1f]
                ${notif.status === "unread" ? "border-[#EFFC76]" : "border-transparent"}`}
            >
              <div className="flex-shrink-0">
                <Image
                  src={notif.image}
                  alt="Notification"
                  width={50}
                  height={50}
                  className="rounded-md"
                />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-4 leading-5 mb-2">{notif.title}</h2>
                <p className="font-normal text-[16px] leading-[20px] text-[#FFFFFF99]">
                  {notif.message}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-2 sm:mt-0 sm:ml-4">
                <span className="font-normal text-xs sm:text-sm leading-[18px] text-[#FFFFFFCC]">
                  {notif.time}
                </span>

                <button
                  onClick={(e) => handleDeleteNotification(notif.id, e)}
                  disabled={loadingIds.has(notif.id)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                    loadingIds.has(notif.id)
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-red-600"
                  }`}
                  title="Delete notification"
                >
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}