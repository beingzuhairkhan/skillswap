'use client'
import React, { useState, useEffect } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { notificationAPI } from '../../services/api'

// Types/Interfaces
interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  userId?: string;
}

interface NotificationResponse {
  data: Notification[];
}

interface UnreadCountResponse {
  data: number;
}

interface NotificationUpdateResponse {
  data: Notification;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Format time ago
  const formatTimeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval}${unit.charAt(0)} ago`;
      }
    }
    return "Just now";
  };

  // Fetch notifications
  const fetchNotifications = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: NotificationResponse = await notificationAPI.getMyNotification();
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load notifications";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const response: UnreadCountResponse = await notificationAPI.unreadCount();
      setUnreadCount(response.data);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: string): Promise<void> => {
    try {
      await notificationAPI.updateRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => notificationAPI.updateRead(n._id))
      );
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Loader2 className="animate-spin text-gray-900" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  bg-white flex justify-center items-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`group flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                  !notification.isRead 
                    ? "bg-gray-50 hover:bg-gray-100" 
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  !notification.isRead 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Bell size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className={`text-sm leading-relaxed ${
                    !notification.isRead 
                      ? "text-gray-900 font-medium" 
                      : "text-gray-600"
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="flex-shrink-0 pt-2">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;