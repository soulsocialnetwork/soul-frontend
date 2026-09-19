import { api } from './api';
import type { PagePostResponse } from './api/types';

export const moderationService = {
  async reportItem(targetId: string, targetType: 'POST' | 'SOULT' | 'ACCOUNT', reason: string): Promise<void> {
    await api.post('/moderation/reports', { targetId, targetType, reason });
  },

  async getHiddenPosts(page = 0, size = 20): Promise<PagePostResponse> {
    const res = await api.get<PagePostResponse>('/moderation/reports/posts', {
      params: { page, size },
    });
    return res.data;
  },
  
  async getReportedAccounts(page = 0, size = 20): Promise<any> {
    const res = await api.get<any>('/moderation/reports/accounts', {
      params: { page, size },
    });
    return res.data;
  },

  async getReportedSoults(page = 0, size = 20) {
    const res = await api.get('/moderation/reports/soults', { params: { page, size } });
    return res.data;
  },

  async removeSoult(id: string): Promise<void> {
    await api.delete(`/moderation/soults/${id}/remove`);
  },

  async ignoreSoultReport(id: string): Promise<void> {
    await api.post(`/moderation/soults/${id}/ignore`);
  },

  async approvePost(postId: string): Promise<void> {
    await api.post(`/moderation/posts/${postId}/approve`);
  },

  async removePost(postId: string): Promise<void> {
    await api.delete(`/moderation/posts/${postId}/remove`);
  },
  
  async banAccount(accountId: string): Promise<void> {
    await api.delete(`/moderation/accounts/${accountId}/ban`);
  },
  
  async ignoreAccountReport(accountId: string): Promise<void> {
    await api.post(`/moderation/accounts/${accountId}/ignore`);
  }
};
