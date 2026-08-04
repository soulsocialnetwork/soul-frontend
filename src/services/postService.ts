import { api } from './api';

export interface PostComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

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
  initialComments?: PostComment[];
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: { 
      id: 'u1', 
      name: 'Renato Valença', 
      username: 'renatoval', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Encontrei essa cafeteria escondida na Lapa hoje. Eles torram o próprio grão e o cheiro do lugar é indescritível. Fiquei umas duas horas só lendo e observando o movimento.',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800',
    likesCount: 1179,
    commentsCount: 35,
    createdAt: new Date(1785804396909).toISOString(),
  },
  {
    id: '2',
    author: { 
      id: 'u2', 
      name: 'Marina Silveira', 
      username: 'ma.silveira', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Comprei umas tintas a óleo e decidi tentar pintar a vista da minha janela. Não sou profissional, mas o processo de misturar as cores e ver a textura na tela é muito relaxante.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800',
    likesCount: 3002,
    commentsCount: 24,
    createdAt: new Date(1785764883761).toISOString(),
  },
  {
    id: '3',
    author: { 
      id: 'u3', 
      name: 'Felipe Nogueira', 
      username: 'felipe.nog', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Finalmente consegui arrumar minha mesa de trabalho. Esconder os cabos deu um trabalhão, mas a sensação de sentar pra trabalhar num ambiente limpo é outra coisa.',
    imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800',
    likesCount: 2921,
    commentsCount: 189,
    createdAt: new Date(1785774924695).toISOString(),
  },
  {
    id: '4',
    author: { 
      id: 'u4', 
      name: 'Lorena Campos', 
      username: 'lorenacampos', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Acordei cedo pra correr e peguei o nascer do sol no parque. Tinha uma neblina baixa ainda... Parecia cena de filme. Valeu a pena o esforço de sair da cama no frio.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    likesCount: 1098,
    commentsCount: 61,
    createdAt: new Date(1785777579040).toISOString(),
  },
  {
    id: '5',
    author: { 
      id: 'u5', 
      name: 'Caio Mendes', 
      username: 'caio.m', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Tentando finalizar O Nome do Vento pela segunda vez. A forma como o Patrick Rothfuss escreve sobre música e magia é única. Se alguém tiver recomendação de fantasia nesse estilo, me fala.',
    imageUrl: 'https://picsum.photos/seed/book/800/600',
    likesCount: 1248,
    commentsCount: 192,
    createdAt: new Date(1785804326277).toISOString(),
  },
  {
    id: '6',
    author: { 
      id: 'u6', 
      name: 'Sofia Albuquerque', 
      username: 'sofia.albuq', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Fiz uma fornada de cookies de chocolate com nozes. A casa inteira tá cheirando a baunilha e manteiga tostada. Segredo: deixar a massa descansar na geladeira de um dia pro outro faz toda a diferença.',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
    likesCount: 2102,
    commentsCount: 111,
    createdAt: new Date(1785775742530).toISOString(),
  },
  {
    id: '7',
    author: { 
      id: 'u7', 
      name: 'Tiago Barros', 
      username: 't.barros', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Comprei um toca-discos antigo num antiquário e passei o fim de semana restaurando. O som analógico tem um chiadinho que traz uma nostalgia muito boa de ouvir jazz antigo.',
    imageUrl: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=800',
    likesCount: 1751,
    commentsCount: 238,
    createdAt: new Date(1785805142788).toISOString(),
  },
  {
    id: '8',
    author: { 
      id: 'u8', 
      name: 'Alice Drummond', 
      username: 'alice.drummond', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Adotei o hábito de não pegar no celular na primeira hora depois de acordar. Fico só tomando meu chá e olhando pela janela. Minha ansiedade diminuiu de forma drástica.',
    imageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80&w=800',
    likesCount: 1877,
    commentsCount: 33,
    createdAt: new Date(1785757719597).toISOString(),
  },
  {
    id: '9',
    author: { 
      id: 'u9', 
      name: 'Henrique Pires', 
      username: 'henriquep', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Alguém mais acompanhando a nova temporada de The Last of Us? A direção de arte deles construindo esses cenários pós-apocalípticos tomados pela natureza é absurda.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    likesCount: 1064,
    commentsCount: 63,
    createdAt: new Date(1785789552150).toISOString(),
  },
  {
    id: '10',
    author: { 
      id: 'u10', 
      name: 'Bianca Vieira', 
      username: 'biavieira.dsgn', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Passei a tarde catalogando minhas plantas e trocando os substratos. Descobri que cuidar de planta é 90% observação e 10% de fato regar.',
    imageUrl: 'https://picsum.photos/seed/plant/800/600',
    likesCount: 638,
    commentsCount: 190,
    createdAt: new Date(1785775715570).toISOString(),
  },
  {
    id: '11',
    author: { 
      id: 'u11', 
      name: 'Marcelo Fonseca', 
      username: 'marcelo.f', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Consegui finalmente aprender a fazer malabarismo com três bolinhas. Foram semanas derrubando tudo no chão, mas a sensação de encaixar o ritmo finalmente é incrível.',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800',
    likesCount: 2407,
    commentsCount: 227,
    createdAt: new Date(1785768128943).toISOString(),
  },
  {
    id: '12',
    author: { 
      id: 'u12', 
      name: 'Heloísa Machado', 
      username: 'heloisa.mach', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Comecei a ir trabalhar de bicicleta duas vezes na semana. O trajeto demora um pouco mais, mas chegar no escritório já com o sangue circulando faz o dia render muito melhor.',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
    likesCount: 2574,
    commentsCount: 88,
    createdAt: new Date(1785783309752).toISOString(),
  },
  {
    id: '13',
    author: { 
      id: 'u13', 
      name: 'Rodrigo Peixoto', 
      username: 'rodrigopeixoto', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Tô tentando zerar Hollow Knight de novo antes de sair a continuação. A mecânica de combate desse jogo é de uma fluidez que eu acho difícil outro indie superar.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    likesCount: 1331,
    commentsCount: 166,
    createdAt: new Date(1785791783738).toISOString(),
  },
  {
    id: '14',
    author: { 
      id: 'u14', 
      name: 'Laura Guimarães', 
      username: 'laura.gui', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Descobri uma loja de cerâmica artesanal no meu bairro. Comprei essa caneca irregular que abraça perfeitamente a mão. O café até parece que ficou mais gostoso.',
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
    likesCount: 1798,
    commentsCount: 146,
    createdAt: new Date(1785793942864).toISOString(),
  },
  {
    id: '15',
    author: { 
      id: 'u15', 
      name: 'Victor Amaral', 
      username: 'victoramrl', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Alguém já testou usar aquelas câmeras de filme antigas? Comprei uma Canon AE-1 num brechó, fiz o primeiro rolo e agora é a tortura de esperar revelar pra ver se tem algo focado.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    likesCount: 2515,
    commentsCount: 169,
    createdAt: new Date(1785787631026).toISOString(),
  },
  {
    id: '16',
    author: { 
      id: 'u16', 
      name: 'Natalia Rocha', 
      username: 'nat.rocha', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Tentei fazer macramê seguindo tutorial no YouTube. O que era pra ser um suporte de vaso virou um emaranhado de nós indecifrável. Vou tentar de novo amanhã.',
    imageUrl: 'https://picsum.photos/seed/macrame/800/600',
    likesCount: 1883,
    commentsCount: 245,
    createdAt: new Date(1785758809842).toISOString(),
  },
  {
    id: '17',
    author: { 
      id: 'u17', 
      name: 'Bruno Medeiros', 
      username: 'b.medeiros', 
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Decidi montar um teclado customizado e acho que criei um buraco negro financeiro na minha vida. Mas digitar nesses switches lubrificados é um caminho sem volta.',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    likesCount: 1932,
    commentsCount: 29,
    createdAt: new Date(1785785319285).toISOString(),
  },
  {
    id: '18',
    author: { 
      id: 'u18', 
      name: 'Clarice Tavares', 
      username: 'clarice.t', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Acabei de assistir Oppenheimer. O design de som daquele filme é esmagador. Aquela cena do teste Trinity, o atraso do som por causa da distância... Cillian Murphy entregou demais.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    likesCount: 13,
    commentsCount: 220,
    createdAt: new Date(1785780304771).toISOString(),
  },
  {
    id: '19',
    author: { 
      id: 'u19', 
      name: 'Fernando Gouveia', 
      username: 'fer.gouveia', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Resolvi aprender xadrez do zero aos 30 anos. Tô apanhando do computador no nível mais fácil, mas a lógica de planejar três jogadas à frente tá mudando meu jeito de pensar no trabalho.',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800',
    likesCount: 2650,
    commentsCount: 156,
    createdAt: new Date(1785776094255).toISOString(),
  },
  {
    id: '20',
    author: { 
      id: 'u20', 
      name: 'Julia Borges', 
      username: 'juliaborges', 
      verified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200'
    },
    content: 'Primeiro pão de queijo caseiro feito do zero que não fica parecendo pedra. Escaldar o polvilho foi a dica de ouro que faltava. Agora ninguém me segura na cozinha.',
    imageUrl: 'https://picsum.photos/seed/baking/800/600',
    likesCount: 830,
    commentsCount: 17,
    createdAt: new Date(1785789008123).toISOString(),
  },
];

const mockCommentsPool = [
  [{ id: 'c1', author: 'Mariana', text: 'Nossa, verdade. Eu percebi a mesma coisa.', time: 'há 10m' }],
  [{ id: 'c2', author: 'Tiago', text: 'Exatamente! Muito bem colocado.', time: 'há 1h' }, { id: 'c3', author: 'Lucas', text: 'Faz todo o sentido, passo pelo mesmo.', time: 'há 30m' }],
  [{ id: 'c4', author: 'Fernanda', text: 'Eu preciso tentar fazer isso. Dá uma paz né?', time: 'há 2h' }],
  [{ id: 'c5', author: 'Bia', text: 'Concordo plenamente. A gente corre demais.', time: 'há 4h' }],
  [{ id: 'c6', author: 'Caio', text: 'Ótima reflexão pra começar a semana.', time: 'há 5h' }],
  [{ id: 'c7', author: 'Julia', text: 'Incrível como pequenos hábitos mudam tudo na rotina.', time: 'há 6h' }],
  [{ id: 'c8', author: 'Roberto', text: 'Muito bom, salvando aqui pra ler de novo depois.', time: 'há 8h' }],
  [{ id: 'c9', author: 'Ana', text: 'Achei que só eu pensava assim! Que alívio.', time: 'há 12h' }],
  [{ id: 'c10', author: 'Matheus', text: 'Real... a gente foca tanto no resultado e esquece de viver o processo.', time: 'há 1 dia' }],
  [{ id: 'c11', author: 'Laura', text: 'Que foto sensacional, transmitiu muita calma.', time: 'há 1 dia' }],
  [{ id: 'c12', author: 'Daniela', text: 'Obrigada por compartilhar, me ajudou bastante.', time: 'há 2 dias' }],
  [{ id: 'c13', author: 'Vitor', text: 'Vou aderir com certeza.', time: 'há 2 dias' }],
  [{ id: 'c14', author: 'Marcelo', text: 'É exatamente sobre isso. Nada a acrescentar.', time: 'há 3 dias' }],
  [{ id: 'c15', author: 'Helena', text: 'Sábias palavras, precisamos de mais posts assim.', time: 'há 3 dias' }],
  [{ id: 'c16', author: 'Bruno', text: 'Tava precisando ler isso hoje. Que timing perfeito.', time: 'há 4 dias' }],
  [{ id: 'c17', author: 'Camila', text: 'Sensacional! Amei a forma como você colocou.', time: 'há 4 dias' }],
  [{ id: 'c18', author: 'Luiza', text: 'Muito inspirador.', time: 'há 5 dias' }, { id: 'c18b', author: 'Igor', text: 'Totalmente! Compartilhei com a minha namorada.', time: 'há 4 dias'}],
  [{ id: 'c19', author: 'Pedro', text: 'Com certeza. Eu também passo por isso diariamente.', time: 'há 5 dias' }],
  [{ id: 'c20', author: 'Sofia', text: 'Amei a perspectiva, muda o jogo inteiro.', time: 'há 6 dias' }],
  [{ id: 'c21', author: 'João', text: 'Que legal, não tinha pensado por esse lado. Boa!', time: 'há 1 semana' }]
];

mockPosts.forEach((post, index) => {
  post.initialComments = mockCommentsPool[index % mockCommentsPool.length];
});

export const postService = {
  async getPosts(): Promise<Post[]> {
    try {
      const response = await api.get<Post[]>('/posts');
      return response.data?.length ? response.data : mockPosts;
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
