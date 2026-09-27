import { api } from './api';

export interface NotificationResponse {
  id: string;
  triggerUsername: string;
  triggerName: string;
  triggerAvatarUrl: string | null;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_ACCEPTED' | 'FOLLOW_REQUEST' | 'MESSAGE' | 'SOULT_LIKE';
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface PageNotificationResponse {
  content: NotificationResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const notificationService = {
  async getNotifications(page = 0, size = 50): Promise<PageNotificationResponse> {
    const response = await api.get<PageNotificationResponse>('/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read');
  },
  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${encodeURIComponent(id)}/read`);
  },
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${encodeURIComponent(id)}`);
  },
  async deleteAllNotifications(): Promise<void> {
    await api.delete('/notifications');
  },
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return response.data.unreadCount;
  },
};

export const NOTIFICATIONS_UPDATED_EVENT = 'soul:notifications-updated';
export function notifyNotificationsUpdated() {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}
