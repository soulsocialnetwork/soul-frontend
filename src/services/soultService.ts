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
  author: SoultAuthor;
  createdAt: string;
  initialComments?: SoultComment[];
}

const mockSoults: Soult[] = [
  {
    id: 's1',
    title: 'A calma da natureza',
    description: 'Um momento de pausa no meio da rotina agitada. Respirar fundo faz toda a diferença.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/nature1/400/800',
    duration: 15,
    likesCount: 342,
    commentsCount: 2,
    createdAt: new Date().toISOString(),
    author: {
      id: 'us1',
      name: 'Mariana Silva',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200',
      verified: false
    },
    initialComments: [
      { id: 'c1', author: 'Roberto Dias', text: 'Eu precisava muito ver isso hoje, minha cabeça tava a mil.', time: 'há 2h' },
      { id: 'c2', author: 'Ana Clara', text: 'Que lugar incrível, onde fica?', time: 'há 1h' }
    ]
  },
  {
    id: 's2',
    title: 'Rotina matinal minimalista',
    description: 'Menos tela, mais foco. Começando o dia com intencionalidade.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/morning/400/800',
    duration: 30,
    likesCount: 1205,
    commentsCount: 3,
    createdAt: new Date().toISOString(),
    author: {
      id: 'us2',
      name: 'Tiago Barros',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200',
      verified: true
    },
    initialComments: [
      { id: 'c3', author: 'Juliana Freitas', text: 'Tenho tentado fazer isso, mas a vontade de pegar o celular assim que acordo é absurda.', time: 'há 5h' },
      { id: 'c4', author: 'Lucas Martins', text: 'O café sem pressa muda tudo.', time: 'há 4h' },
      { id: 'c5', author: 'Bia Vieira', text: 'Vou tentar amanhã, juro.', time: 'há 30m' }
    ]
  },
  {
    id: 's3',
    title: 'Arte e processo',
    description: 'O processo é sempre mais bagunçado do que o resultado final.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/art/400/800',
    duration: 45,
    likesCount: 890,
    commentsCount: 1,
    createdAt: new Date().toISOString(),
    author: {
      id: 'us3',
      name: 'Camila Rocha',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200',
      verified: false
    },
    initialComments: [
      { id: 'c6', author: 'Fernanda Lima', text: 'A textura ficou perfeita! Qual material você usou na base?', time: 'há 10h' }
    ]
  },
  {
    id: 's4',
    title: 'Foco nos estudos',
    description: 'Quando a técnica pomodoro finalmente começa a dar resultado.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/study/400/800',
    duration: 20,
    likesCount: 567,
    commentsCount: 2,
    createdAt: new Date().toISOString(),
    author: {
      id: 'us4',
      name: 'João Pedro',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200',
      verified: false
    },
    initialComments: [
      { id: 'c7', author: 'Matheus Costa', text: 'Eu só consigo focar se tiver música clássica tocando de fundo rs.', time: 'há 12h' },
      { id: 'c8', author: 'Laura', text: 'Bora que o semestre não perdoa!', time: 'há 8h' }
    ]
  },
  {
    id: 's5',
    title: 'Tecnologia consciente',
    description: 'Reflexões sobre como usamos as ferramentas do nosso tempo.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/tech/400/800',
    duration: 60,
    likesCount: 2100,
    commentsCount: 3,
    createdAt: new Date().toISOString(),
    author: {
      id: 'us5',
      name: 'Prof. Carlos',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&h=200',
      verified: true
    },
    initialComments: [
      { id: 'c9', author: 'Daniela', text: 'Incrível essa perspectiva. A ferramenta não é ruim, o uso que fazemos dela que dita o resultado.', time: 'há 1 dia' },
      { id: 'c10', author: 'Pedro H.', text: 'Fiquei pensando nisso o fim de semana todo.', time: 'há 20h' },
      { id: 'c11', author: 'Sofia', text: 'Ótima reflexão professor!', time: 'há 10h' }
    ]
  }
];

export const soultService = {
  async getSoults(): Promise<Soult[]> {
    return mockSoults;
  },

  async likeSoult(_id: string): Promise<void> {
    // Integrar com: POST /soults/:id/like
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