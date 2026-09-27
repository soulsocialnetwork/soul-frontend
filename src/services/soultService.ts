import { api } from './api';
import type { ProfileBadgeKind } from '../components/profile/ProfileBadge';

export interface SoultItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  category: string | null;
  duration: number | null;
  viewsCount: number;
  likesCount: number;
  hasLiked: boolean;
  saved: boolean;
  createdAt: string;
  userId: string;
  username: string;
  name: string;
  profilePicture: string | null;
  profileBadge?: ProfileBadgeKind;
}

export interface SoultAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  verified?: boolean;
  profileBadge?: ProfileBadgeKind;
}

export interface SoultComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface Soult {
  id: string;
  title: string;
  description: string;
  category?: string;
  audience?: 'PUBLIC' | 'REAL_FRIENDS' | 'PRIVATE';
  videoUrl?: string;
  thumbnailUrl: string;
  duration: number;
  likesCount: number;
  commentsCount: number;
  hasLiked?: boolean;
  saved?: boolean;
  userId?: string;
  username?: string;
  author: SoultAuthor;
  createdAt: string;
  initialComments?: SoultComment[];
}

function mapRawToSoult(s: any): Soult {
  return {
    id: s.id,
    title: s.caption || 'Sem legenda',
    description: '',
    category: s.category || undefined,
    audience: s.audience || 'PUBLIC',
    videoUrl: s.videoUrl,
    thumbnailUrl: s.thumbnailUrl || '',
    duration: s.duration || 0,
    likesCount: s.likesCount || 0,
    commentsCount: 0,
    hasLiked: s.hasLiked || false,
    saved: s.saved || false,
    userId: s.userId,
    username: s.username,
    author: {
      id: s.userId,
      name: s.name || s.username || '',
      avatarUrl: s.profilePicture,
      verified: false,
      profileBadge: s.profileBadge || 'NONE',
    },
    createdAt: s.createdAt,
  };
}

// concentra leitura, publicação e interações persistidas dos soults
export const soultService = {
  async getSoult(id: string): Promise<Soult> {
    const res = await api.get(`/soults/${encodeURIComponent(id)}`);
    return mapRawToSoult(res.data);
  },
  async getSoultsPage(page = 0, size = 10, category?: string | null): Promise<{ items: Soult[]; last: boolean }> {
    const res = await api.get<{ content: any[]; last: boolean }>('/soults', { params: { page, size, ...(category ? { category } : {}) } });
    return { items: (res.data.content ?? []).map(mapRawToSoult), last: res.data.last ?? true };
  },
  async getSoults(page = 0, size = 10): Promise<Soult[]> {
    return (await this.getSoultsPage(page, size)).items;
  },

  async getSoultsByUsername(username: string, page = 0, size = 20): Promise<Soult[]> {
    const res = await api.get<{ content: any[] }>(`/soults/user/${encodeURIComponent(username)}`, {
      params: { page, size },
    });
    return (res.data.content ?? []).map(mapRawToSoult);
  },

  async createSoult(data: {
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    category?: string;
    duration?: number;
    audience?: 'PUBLIC' | 'REAL_FRIENDS' | 'PRIVATE';
  }): Promise<Soult> {
    const res = await api.post<any>('/soults', data);
    return mapRawToSoult(res.data);
  },

  async deleteSoult(id: string): Promise<void> {
    await api.delete(`/soults/${id}`);
  },

  async updateSoult(id: string, data: { caption: string; audience: 'PUBLIC' | 'REAL_FRIENDS' | 'PRIVATE' }): Promise<Soult> {
    const response = await api.patch(`/soults/${encodeURIComponent(id)}`, data);
    return mapRawToSoult(response.data);
  },

  async likeSoult(id: string): Promise<void> {
    await api.post(`/soults/${id}/like`);
  },

  async unlikeSoult(id: string): Promise<void> {
    await api.delete(`/soults/${id}/like`);
  },

  async getSavedSoults(page = 0, size = 20): Promise<Soult[]> {
    const res = await api.get<{ content: unknown[] }>('/soults/saved', { params: { page, size } });
    return (res.data.content ?? []).map(mapRawToSoult);
  },

  async saveSoult(id: string): Promise<void> {
    await api.post(`/soults/${encodeURIComponent(id)}/save`);
  },

  async unsaveSoult(id: string): Promise<void> {
    await api.delete(`/soults/${encodeURIComponent(id)}/save`);
  },

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${secs}s`;
  },
};
