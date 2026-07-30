import { api } from './api';

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: { 
      id: 'u1', 
      name: 'Luiza Montenegro', 
      username: 'luizamontenegro', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Passei numa cafeteria no caminho de casa e fiquei 1 hora só olhando pra rua sem olhar o cel. Na moral, que paz mental kkkk',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
    likesCount: 1245,
    commentsCount: 89,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    author: { 
      id: 'u2', 
      name: 'Arthur Cordeiro', 
      username: 'arthur.cordeiro', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Mano... olha essa vista pqp. Fugi da cidade esse fds se não ia surtar real',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    likesCount: 3891,
    commentsCount: 164,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    author: { 
      id: 'u3', 
      name: 'Mariana Duarte', 
      username: 'mariduarte.art', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Tava uns 6 meses sem encostar nos meus quadros mas hoje finalmente saiu alguma coisa. Até que gostei',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
    likesCount: 856,
    commentsCount: 42,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '4',
    author: { 
      id: 'u4', 
      name: 'Lucas Ferreira', 
      username: 'lucas.dev', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: '03h da manhã e eu arrumando a mesa do PC em vez de dormir. Terapia barata dms kkkk',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    likesCount: 642,
    commentsCount: 31,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: '5',
    author: { 
      id: 'u5', 
      name: 'Beatriz Lima', 
      username: 'biacosta', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Parada no trânsito mas o céu tá surreal de lindo hoje. Pelo menos isso',
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80&w=800',
    likesCount: 2150,
    commentsCount: 112,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '6',
    author: { 
      id: 'u6', 
      name: 'Gabriel Ferreira', 
      username: 'gabs_ferreira', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Almoço de domingo na casa da vó sem condições. Saí de lá quase passando mal de tanto comer',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    likesCount: 980,
    commentsCount: 54,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

export const postService = {
  async getPosts(): Promise<Post[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const response = await api.get<Post[]>('/posts');
      return response.data.length ? response.data : mockPosts;
    } catch {
      return mockPosts;
    }
  },

  async interactWithPost(postId: string, type: 'LIKE' | 'SAVE'): Promise<void> {
    try {
      await api.post(`/posts/${postId}/interact`, { type });
    } catch {
      // silently ignore – UI is already updated optimistically
    }
  },
};