'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationsApi } from '@/app/api/Admin/notifications';

interface NotificationContextType {
  notificationCount: number;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | {
  notificationCount: number;
  refreshNotifications: () => Promise<void>;
}>({
  notificationCount: 0,
  refreshNotifications: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);

  const refreshNotifications = async () => {
    try {
      console.log('Refreshing notifications...');
      const response = await notificationsApi.getNotifications();
      if (response?.data) {
        const count = response.data.total;
        console.log('New notification count:', count);
        setNotificationCount(count);
        localStorage.setItem('adminNotifications', count.toString());
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('adminNotifications');
      if (stored) {
        setNotificationCount(Number(stored));
      }
    }
  };

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notificationCount, 
      refreshNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotificationContext used outside provider, using default');
    return {
      notificationCount: Number(localStorage.getItem('adminNotifications')) || 0,
      refreshNotifications: async () => {},
    };
  }
  return context;
};