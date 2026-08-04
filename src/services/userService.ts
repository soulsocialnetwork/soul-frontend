/**
 * userService.ts
 * Camada de dados de usuários.
 * Quando o backend estiver pronto, as chamadas api.get/post retornarão os dados reais.
 */
import { api } from './api';

export interface UserPost {
  id: string;
  imageUrl: string;
  content?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  verified: boolean;
  connectionsCount: number;
  friendsCount: number;
  postsCount: number;
  posts: UserPost[];
}

const mockProfiles: Record<string, UserProfile> = {
  'renatoval': {
    id: 'u1',
    name: 'Renato Valença',
    username: 'renatoval',
    avatarUrl: 'https://i.pravatar.cc/150?u=renatoval',
    bio: 'Leitor compulsivo e ciclista de fim de semana.\nTentando desacelerar sem perder o ritmo.',
    verified: false,
    connectionsCount: 31,
    friendsCount: 3,
    postsCount: 8,
    posts: [
      { id: 'r1', imageUrl: 'https://picsum.photos/seed/renato1/600/600', content: 'Terminei O Nome do Vento pela segunda vez. Ainda impressionante.' },
      { id: 'r2', imageUrl: 'https://picsum.photos/seed/renato2/600/600', content: 'Trilha da manhã antes do trabalho. Vale cada minuto de sono perdido.' },
      { id: 'r3', imageUrl: 'https://picsum.photos/seed/renato3/600/600', content: 'Café, caderno e uma ideia que pode virar projeto.' },
      { id: 'r4', imageUrl: 'https://picsum.photos/seed/renato4/600/600', content: 'Fim de semana sem tela. Spoiler: foi bom demais.' },
    ],
  },
  'ma.silveira': {
    id: 'u2',
    name: 'Mariana Silveira',
    username: 'ma.silveira',
    avatarUrl: 'https://i.pravatar.cc/150?u=ma.silveira',
    bio: 'Designer. Gosto de coisas bem feitas e de lugares com boa iluminação.\nSão Paulo.',
    verified: false,
    connectionsCount: 58,
    friendsCount: 5,
    postsCount: 14,
    posts: [
      { id: 'm1', imageUrl: 'https://picsum.photos/seed/mari1/600/600', content: 'Nova paleta aprovada pelo cliente. Gratidão por projetos que respiram.' },
      { id: 'm2', imageUrl: 'https://picsum.photos/seed/mari2/600/600', content: 'Mercado de artesanato esse fim de semana. Tanta coisa bonita feita à mão.' },
      { id: 'm3', imageUrl: 'https://picsum.photos/seed/mari3/600/600', content: 'Organizando o estúdio. Espaço limpo, mente limpa.' },
      { id: 'm4', imageUrl: 'https://picsum.photos/seed/mari4/600/600', content: 'Café da tarde com a equipe.' },
      { id: 'm5', imageUrl: 'https://picsum.photos/seed/mari5/600/600', content: 'Referências para o projeto novo. Cada detalhe importa.' },
    ],
  },
  'felipe.nog': {
    id: 'u3',
    name: 'Felipe Nogueira',
    username: 'felipe.nog',
    avatarUrl: 'https://i.pravatar.cc/150?u=felipe.nog',
    bio: 'Curioso por natureza. Fotógrafo nas horas vagas.\nSempre que posso, prefiro caminhar.',
    verified: false,
    connectionsCount: 22,
    friendsCount: 2,
    postsCount: 6,
    posts: [
      { id: 'f1', imageUrl: 'https://picsum.photos/seed/felipe1/600/600', content: 'Pôr do sol na ponte. Essa cidade tem seus momentos.' },
      { id: 'f2', imageUrl: 'https://picsum.photos/seed/felipe2/600/600', content: 'Experimento com luz natural. Ainda aprendendo.' },
      { id: 'f3', imageUrl: 'https://picsum.photos/seed/felipe3/600/600', content: 'Parque vazio numa segunda de manhã.' },
    ],
  },
  'julia.borges': {
    id: 'u4',
    name: 'Julia Borges',
    username: 'julia.borges',
    avatarUrl: 'https://i.pravatar.cc/150?u=julia.borges',
    bio: 'Cozinho para relaxar, não para impressionar.\nReceitas simples e honestas.',
    verified: false,
    connectionsCount: 19,
    friendsCount: 1,
    postsCount: 5,
    posts: [
      { id: 'j1', imageUrl: 'https://picsum.photos/seed/julia1/600/600', content: 'Pão de queijo do zero. A dica do polvilho escaldado mudou tudo.' },
      { id: 'j2', imageUrl: 'https://picsum.photos/seed/julia2/600/600', content: 'Risoto de domingo. O processo é metade do prazer.' },
      { id: 'j3', imageUrl: 'https://picsum.photos/seed/julia3/600/600', content: 'Mesa posta pra janta com os amigos.' },
    ],
  },
};

// ─── API ───────────────────────────────────────────────────────────────────────
export const userService = {
  async getByUsername(username: string): Promise<UserProfile | null> {
    try {
      const response = await api.get<UserProfile>(`/users/${username}`);
      return response.data ?? mockProfiles[username] ?? null;
    } catch {
      return mockProfiles[username] ?? null;
    }
  },

  async connect(targetUserId: string, intent: string): Promise<void> {
    try {
      await api.post(`/connections`, { targetUserId, intent });
    } catch {
      // Otimisticamente confirmado no UI
    }
  },

  async disconnect(targetUserId: string): Promise<void> {
    try {
      await api.delete(`/connections/${targetUserId}`);
    } catch {
      // Otimisticamente confirmado no UI
    }
  },

  async validateFriendQr(qrToken: string): Promise<{ success: boolean; friendName?: string }> {
    try {
      const response = await api.post<{ success: boolean; friendName: string }>(
        '/friends/qr-validate',
        { token: qrToken }
      );
      return response.data;
    } catch {
      return { success: false };
    }
  },
};
