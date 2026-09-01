import { apiRequest } from './apiClient';
import type { AppNotification } from '../types/kanban';

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

type NotificationListener = (notification: AppNotification) => void;

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
  },

  /**
   * Subscribe to real-time notification stream (WebSocket / SSE / Polling Fallback)
   */
  subscribeToLiveNotifications(onNotification: NotificationListener): () => void {
    let ws: WebSocket | null = null;
    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let isCleanedUp = false;

    const connectWebSocket = () => {
      if (isCleanedUp) return;

      const customWsUrl = (import.meta as any).env?.VITE_WS_URL;
      if (!customWsUrl) {
        // Use clean polling / internal event stream by default
        startPollingFallback();
        return;
      }

      try {
        ws = new WebSocket(customWsUrl);

        ws.onopen = () => {
          console.info('[NotificationWS] Connected to live notification stream');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && (data.id || data.message || data.eventType)) {
              onNotification({
                id: data.id || `notif-${Date.now()}`,
                recipientId: data.recipientId || '',
                actorName: data.actorName || 'System',
                actorAvatar: data.actorAvatar,
                eventType: data.eventType || 'TASK_MOVED',
                taskTitle: data.taskTitle || '',
                taskId: data.taskId,
                message: data.message || 'New workspace activity',
                read: false,
                createdAt: data.createdAt || new Date().toISOString(),
              });
            }
          } catch (e) {
            console.debug('[NotificationWS] Non-JSON payload received:', event.data);
          }
        };

        ws.onerror = () => {
          // Silent fallback to polling if WebSocket fails (e.g. sandboxed iframe)
          startPollingFallback();
        };

        ws.onclose = () => {
          if (!isCleanedUp) {
            setTimeout(connectWebSocket, 10000);
          }
        };
      } catch (err) {
        startPollingFallback();
      }
    };

    const startPollingFallback = () => {
      if (pollingTimer || isCleanedUp) return;
      pollingTimer = setInterval(async () => {
        try {
          const res = await notificationApi.getNotifications();
          if (res.notifications && res.notifications.length > 0) {
            // Find newly arrived unread notifications
            const latest = res.notifications.find(n => !n.read);
            if (latest) {
              onNotification(latest);
            }
          }
        } catch {
          // ignore transient errors
        }
      }, 15000);
    };

    // Attempt real-time connection
    connectWebSocket();

    // Cleanup function
    return () => {
      isCleanedUp = true;
      if (ws) {
        try {
          ws.close();
        } catch {}
      }
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }
};
