import { apiRequest } from './apiClient';
import type { AppNotification } from '../types/kanban';

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

/**
 * Notification Service API (Spring Boot 3 + Redis + WebSockets via /api/notifications/*)
 */
export const notificationApi = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(): Promise<NotificationListResponse> {
    const res = await apiRequest<any>('/notifications', {
      method: 'GET',
    });
    return {
      notifications: Array.isArray(res?.notifications) ? res.notifications : [],
      unreadCount: res?.unreadCount || 0,
    };
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const res = await apiRequest<UnreadCountResponse>('/notifications/unread-count', {
      method: 'GET',
    });
    return res?.unreadCount || 0;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string): Promise<AppNotification> {
    return apiRequest<AppNotification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<void> {
    await apiRequest<void>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }
};
