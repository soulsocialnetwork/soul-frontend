export interface SoultAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  verified?: boolean;
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
  author: SoultAuthor;
  createdAt: string;
}

// guarda os dados fakes dos vídeos (:`
const MOCK_SOULTS: Soult[] = [
  {
    id: '1',
    title: 'acordei cedo e valeu',
    description: 'literalmente sozinha no mundo às 6h vendo o sol nascer kkk. tô aprendendo a curtir o silêncio',
    thumbnailUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
    videoUrl: 'https://videos.pexels.com/video-files/4019405/4019405-uhd_1440_2560_25fps.mp4',
    duration: 45,
    likesCount: 1420,
    commentsCount: 38,
    author: {
      id: 'a1',
      name: 'Luísa Mendes',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      verified: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'chuva + fone no ouvido',
    description: 'coloca o som da chuva, fecha os olhos por 5 min e me fala se não tá melhor depois 🙏',
    thumbnailUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
    videoUrl: 'https://videos.pexels.com/video-files/5896379/5896379-uhd_1440_2560_24fps.mp4',
    duration: 60,
    likesCount: 2890,
    commentsCount: 94,
    author: {
      id: 'a2',
      name: 'Pedro Henrique',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      verified: false,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'pausa obrigatória',
    description: 'larga o cel e vai respirar. não tô brincando não 😭 eu precisava ouvir isso também',
    thumbnailUrl: 'https://images.pexels.com/photos/15286/pexels-photo.jpg',
    videoUrl: 'https://videos.pexels.com/video-files/5192077/5192077-uhd_1440_2560_25fps.mp4',
    duration: 30,
    likesCount: 5120,
    commentsCount: 182,
    author: {
      id: 'a3',
      name: 'Marina Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      verified: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'esse fim de tarde 😩',
    description: 'mds q cor é essa. eu tava aqui achando que tava ruim o dia kk obrigado natureza',
    thumbnailUrl: 'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg',
    videoUrl: 'https://videos.pexels.com/video-files/6122605/6122605-uhd_1440_2560_25fps.mp4',
    duration: 50,
    likesCount: 980,
    commentsCount: 21,
    author: {
      id: 'a4',
      name: 'Tiago Souza',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      verified: false,
    },
    createdAt: new Date().toISOString(),
  }
];

export const soultService = {
  async getSoults(): Promise<Soult[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_SOULTS;
  },

  async likeSoult(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log(`Soult ${id} curtido!`);
  },

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${secs}s`;
  }
};