import { api } from './api';

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
  createdAt: string;
  userId: string;
  username: string;
  name: string;
  profilePicture: string | null;
}

// Legacy type used by SoultList component
export interface SoultAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  verified?: boolean;
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
  videoUrl?: string;
  thumbnailUrl: string;
  duration: number;
  likesCount: number;
  commentsCount: number;
  hasLiked?: boolean;
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
    description: s.category || '',
    videoUrl: s.videoUrl,
    thumbnailUrl: s.thumbnailUrl || s.videoUrl,
    duration: s.duration || 0,
    likesCount: s.likesCount || 0,
    commentsCount: 0,
    hasLiked: s.hasLiked || false,
    userId: s.userId,
    username: s.username,
    author: {
      id: s.userId,
      name: s.name || s.username || '',
      avatarUrl: s.profilePicture,
      verified: false,
    },
    createdAt: s.createdAt,
  };
}

export const soultService = {
  async getSoults(page = 0, size = 10): Promise<Soult[]> {
    const res = await api.get<{ content: any[] }>('/soults', { params: { page, size } });
    return (res.data.content ?? []).map(mapRawToSoult);
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
  }): Promise<Soult> {
    const res = await api.post<any>('/soults', data);
    return mapRawToSoult(res.data);
  },

  async deleteSoult(id: string): Promise<void> {
    await api.delete(`/soults/${id}`);
  },

  async likeSoult(id: string): Promise<void> {
    await api.post(`/soults/${id}/like`);
  },

  async unlikeSoult(id: string): Promise<void> {
    await api.delete(`/soults/${id}/like`);
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
