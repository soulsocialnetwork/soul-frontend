import { api } from './api';
import type { PostResponse, PagePostResponse } from './api/types';

export const moderationService = {
  async reportPost(postId: string, reason: string): Promise<void> {
    await api.post(`/moderation/posts/${postId}/reports`, { reason });
  },

  async getHiddenPosts(page = 0, size = 20): Promise<PagePostResponse> {
    const res = await api.get<PagePostResponse>('/moderation/posts', {
      params: { page, size },
    });
    return res.data;
  },

  async approvePost(postId: string): Promise<void> {
    await api.post(`/moderation/posts/${postId}/approve`);
  },

  async removePost(postId: string): Promise<void> {
    await api.delete(`/moderation/posts/${postId}/remove`);
  },
};
