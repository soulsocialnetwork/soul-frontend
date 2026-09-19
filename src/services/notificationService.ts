import { api } from './api';

export interface NotificationResponse {
  id: string;
  triggerUsername: string;
  triggerName: string;
  triggerAvatarUrl: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_ACCEPTED';
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
};
