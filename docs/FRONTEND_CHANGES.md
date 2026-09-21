# Alterações do frontend

## Escopo da comparação

- baseline: `a2af9a98de41bce9c8843d051ca9e2ef17c39941`
- comparação: baseline contra o estado local após a limpeza de comentários
- resultado funcional anterior à criação deste documento: 22 arquivos adicionados, 50 alterados e nenhum removido
- mudanças de formatação isoladas, reorganização de imports e pequenos ajustes cosméticos não são detalhados

## Resumo

O frontend passou de um conjunto básico de páginas para uma aplicação integrada à API em autenticação, posts, Soults, mensagens, notificações, perfil, destaques, amizades reais, moderação e configurações. Foram adicionados controle de sessão com renovação de token, rotas protegidas, recuperação e verificação de conta, câmera e leitura de QR, mídia autenticada, tempo de tela local, página dedicada de post e ferramentas administrativas.

A interface também consolidou categorias, estados de interação vindos do servidor, navegação responsiva e tokens visuais compartilhados. O idioma ativo foi reduzido a pt-BR. Nenhum arquivo presente na baseline foi removido.

## Arquivos adicionados

| Caminho | Responsabilidade |
| --- | --- |
| `soulzinho.png` | imagem do mascote usada como ativo visual do perfil institucional |
| `src/assets/soulzinho-cursor.png` | ativo leve usado pelo cursor temático |
| `src/components/modals/ReportModal.tsx` | formulário reutilizável de denúncia de conteúdo ou conta |
| `src/components/profile/QrScanner.tsx` | leitura de QR de perfil para o fluxo de amizade real |
| `src/components/router/PrivateRoute.tsx` | proteção de rotas autenticadas e redirecionamento das rotas públicas |
| `src/components/ui/CameraCapture.tsx` | captura de foto ou vídeo pelo dispositivo com preview |
| `src/components/ui/SecureMedia.tsx` | carregamento autenticado de imagens e vídeos privados |
| `src/components/ui/SoulzinhoCursor.tsx` | cursor temático aplicado ao perfil institucional e ao administrador |
| `src/constants/categories.tsx` | catálogo compartilhado de IDs, nomes e ícones das categorias |
| `src/hooks/useCameraStream.ts` | ciclo de vida do stream da câmera e encerramento seguro das faixas |
| `src/hooks/useNotificationCount.ts` | consulta e atualização periódica do total de notificações não lidas |
| `src/hooks/useScreenUsage.ts` | registro local do tempo de uso diário em primeiro plano |
| `src/pages/Auth/ResetPassword.tsx` | conclusão da recuperação de senha por token |
| `src/pages/Auth/VerifyEmail.tsx` | confirmação de endereço de e-mail |
| `src/pages/Moderation/index.tsx` | central administrativa para denúncias, conteúdos e contas |
| `src/pages/PostDetail/index.tsx` | rota dedicada para leitura e interação com um post |
| `src/services/api/page.ts` | normalização dos formatos de paginação retornados pelo Spring Data |
| `src/services/messageService.ts` | operações de conversas, mensagens e ações locais sobre DMs |
| `src/services/moderationService.ts` | integração dos fluxos administrativos com a API |
| `src/services/notificationService.ts` | consulta, leitura e contagem de notificações |
| `src/utils/mediaValidation.ts` | validação compartilhada de tipo e tamanho antes de uploads |
| `src/utils/profileQr.ts` | geração e interpretação de URLs públicas usadas em QR de perfil |

## Arquivos alterados

### Estrutura, autenticação e integração

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/App.tsx` | adiciona carregamento sob demanda, rotas públicas/protegidas, post detalhado, recuperação, verificação, moderação, cursor e rastreamento de uso |
| `src/context/AuthContext.tsx` | restaura sessão, expõe atualização do usuário e reage à expiração global de credenciais |
| `src/services/api/client.ts` | anexa o token, coordena uma única renovação concorrente e encerra sessões inválidas |
| `src/services/api/endpoints.ts` | amplia o catálogo de endpoints para Soults, mensagens, notificações e estado de curtida |
| `src/services/api/httpError.ts` | extrai mensagens e erros de campo das respostas da API |
| `src/services/api/types.ts` | incorpora papéis, preferências, métricas de perfil, categorias, interações, Soults e notificações |
| `src/services/authService.ts` | adiciona recuperação, redefinição, renovação e encerramento resiliente de sessão |
| `src/services/userService.ts` | amplia perfil, privacidade, relações, solicitações e preferências persistidas |
| `vite.config.ts` | configura proxy local para API e mídia |
| `package.json` | adiciona bibliotecas de QR e respectivas tipagens |
| `package-lock.json` | fixa as novas dependências e suas árvores transitivas |
| `.gitignore` | ajusta arquivos locais ignorados pelo repositório |
| `README.md` | documenta configuração da URL da API e requisitos de execução |
| `index.html` | amplia metadados, favicon, compartilhamento social e informações de PWA |

### Posts, feed e categorias

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/pages/Feed/index.tsx` | integra paginação, busca, filtros por aba/categoria e atualização do feed |
| `src/components/feed/FeedTabs.tsx` | reorganiza os filtros principais e o seletor de categorias |
| `src/components/feed/PostCard.tsx` | usa contagens reais, estado de curtida, comentários, seguir, denúncia, exclusão e navegação para detalhe |
| `src/components/feed/PostList.tsx` | ajusta seleção consciente, paginação e leitura em foco |
| `src/services/postService.ts` | centraliza posts, comentários, curtidas, salvos, denúncias e upload de mídia |
| `src/pages/Create/index.tsx` | unifica criação de post e Soult, categorias, câmera, preview, confirmação e validações de mídia e duração |

### Soults e mídia

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/pages/Soults/index.tsx` | carrega o feed paginado e mantém somente o vídeo ativo em reprodução |
| `src/components/soults/SoultCard.tsx` | adiciona player, progresso, primeiro frame, curtida, salvamento, comentários, compartilhamento, denúncia e legenda expansível |
| `src/components/soults/SoultList.tsx` | adapta a lista ao modelo atual e ao controle de item ativo |
| `src/services/soultService.ts` | integra criação, consulta, perfis, curtidas e Soults salvos |
| `src/components/ui/ImageUrlModal.tsx` | adapta seleção e preview de mídia ao fluxo atual |

### Perfil, destaques, QR e amigos reais

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/pages/Profile/index.tsx` | concentra edição, avatar, métricas, amigos reais, QR, destaques, posts, Soults e salvos |
| `src/pages/UserProfile/index.tsx` | trata perfil alheio, privacidade, seguir, amizade real, mensagem, denúncia, posts e Soults |
| `src/pages/ProfilePage/ProfilePage.tsx` | atualiza a visualização alternativa de perfil, destaques e publicações |
| `src/components/profile/ConnectionsModal.tsx` | atualiza seguidores e seguindo com os dados atuais de perfil |
| `src/components/profile/RealFriendsModal.tsx` | lista amizades reais e permite convidar contatos elegíveis |
| `src/pages/CreateHighlight/CreateHighlightPage.tsx` | integra criação de destaque com upload, câmera e preview |

### Mensagens, notificações e moderação

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/pages/Messages/index.tsx` | implementa lista de conversas, polling, envio, leitura, bloqueio, denúncia, limpeza e exclusão local |
| `src/components/layout/NotificationsPanel.tsx` | apresenta notificações e solicitações, aceita ou rejeita ações e marca itens como lidos |
| `src/components/layout/Header.tsx` | conecta notificações e identidade do usuário ao cabeçalho responsivo |
| `src/components/layout/Sidebar.tsx` | adiciona navegação contextual, badge, moderação por papel e sessão |
| `src/components/layout/BottomNav.tsx` | alinha a navegação móvel às rotas principais atuais |

### Conta, tempo de tela e conteúdo institucional

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/pages/Settings/index.tsx` | reorganiza conta, privacidade, notificações, preferências, sessão e zona de perigo conforme suporte real da API |
| `src/pages/Screentime/index.tsx` | mostra histórico diário, média e sessão de foco persistidos no navegador |
| `src/components/screentime/FocusMode.tsx` | ajusta a apresentação da sessão de foco |
| `src/pages/Auth/index.tsx` | integra login e cadastro aos fluxos de sessão atuais |
| `src/components/auth/AuthForm.tsx` | amplia validação de cadastro, recuperação de senha e feedback de erros |
| `src/components/auth/AuthHeader.tsx` | ajusta o cabeçalho compartilhado das telas de autenticação |
| `src/pages/Initial/index.tsx` | atualiza a apresentação inicial e os acessos à autenticação |
| `src/pages/DataTransparency/index.tsx` | ajusta a página informativa à navegação atual |
| `src/pages/DigitalEducation/index.tsx` | ajusta a página educativa à navegação atual |
| `src/i18n/config.ts` | fixa a experiência disponível em pt-BR |
| `src/i18n/index.ts` | remove documentação inline obsoleta sem mudar a exportação existente |

### Sistema visual e responsividade

| Caminho | Alteração e comportamento afetado |
| --- | --- |
| `src/styles/global.css` | consolida superfícies, foco acessível, squircle, bordas de vidro, cursor e regras responsivas |
| `tailwind.config.js` | associa os raios utilitários ao token visual compartilhado e remove a supressão global de foco |
| `src/components/ui/CustomSelect.tsx` | alinha o seletor compartilhado ao sistema visual atual |

## Arquivos removidos

Nenhum arquivo foi removido desde a baseline.

## Funcionalidades adicionadas

- rotas protegidas e públicas com carregamento sob demanda;
- recuperação de senha, verificação de e-mail e renovação de sessão;
- página permanente por ID de post;
- criação, reprodução, curtida, salvamento e comentários de Soults;
- DMs com ações de bloquear, denunciar, limpar e ocultar conversa por usuário;
- notificações, solicitações de seguimento e contagem de não lidas;
- perfis privados e solicitações de seguimento;
- amigos reais por convite ou QR de perfil;
- câmera para fotos e vídeos e leitor de QR;
- destaques com criação e visualização;
- painel de moderação para administradores;
- tempo de tela local, histórico, média e modo foco;
- mídia autenticada e validação de uploads;
- perfil institucional e cursor temático do Soul.

## Funcionalidades alteradas

- posts passaram a usar categorias, estados reais de interação, contagens e rota de detalhe;
- feed passou a compartilhar o catálogo de categorias usado na criação;
- perfil passou a separar posts, Soults e itens salvos, além de expor amigos reais;
- Soults passaram a pausar vídeos fora de foco, exibir primeiro frame e limitar publicação a cinco minutos;
- autenticação passou a invalidar a sessão de forma global após falha de renovação;
- configurações passaram a refletir apenas opções suportadas pela aplicação e API;
- idioma disponível foi mantido somente em pt-BR;
- foco visual recuperou indicação acessível com estilo sutil;
- componentes de perfil e superfícies adotaram tokens compartilhados de raio e borda.

## Componentes e páginas importantes adicionados

- `ModerationPage`, `PostDetailPage`, `ResetPasswordPage` e `VerifyEmailPage`;
- `CameraCapture`, `QrScanner`, `SecureImage`, `SecureVideo` e `SoulzinhoCursor`;
- `ReportModal` e `PrivateRoute`/`PublicRoute`.

## Services, hooks, contexto e estado

- `AuthContext` passou a ser a fonte global da sessão e da atualização do usuário;
- o cliente Axios passou a serializar renovação de token e emitir expiração de sessão;
- novos services isolam mensagens, notificações e moderação;
- services de posts, Soults e usuários cobrem os novos endpoints e estados de interação;
- hooks controlam câmera, contagem de notificações e uso diário do navegador;
- a paginação da API é normalizada em um utilitário compartilhado.

## Integrações

- API Spring Boot via `VITE_API_URL` e proxy local do Vite;
- câmera e mídia do navegador;
- geração de QR com `qrcode`;
- leitura de QR com ZXing;
- armazenamento local para tempo de tela, foco e estados locais de conversa.

## UI e design system

- raio squircle centralizado em `--soul-radius` e utilitários Tailwind;
- bordas translúcidas compartilhadas em avatares, destaques e superfícies de vidro;
- foco por teclado preservado com tratamento menos intenso;
- navegação adaptada entre sidebar desktop e barra inferior móvel;
- cards, modais e páginas principais ajustados para larguras e fluxos responsivos.

## Limpeza de comentários

Foram removidos 154 comentários antigos, temporários, redundantes ou usados como marcadores visuais em JSX. Foram adicionados comentários curtos apenas em 19 pontos centrais: roteamento, sessão, cliente da API, câmera, tempo de tela, mídia segura, criação, perfis, mensagens, moderação, notificações, QR, amigos reais, posts, Soults e seus services. As três diretivas de tipo do Vite e do Tailwind foram preservadas por servirem ao tooling.

## Resumo técnico final

- 22 arquivos funcionais foram adicionados e 50 arquivos existentes foram alterados antes desta documentação;
- nenhum arquivo da baseline foi removido;
- os maiores acréscimos estão em mensagens, perfil, moderação, Soults e notificações;
- autenticação, mídia e paginação ganharam infraestrutura compartilhada;
- categorias e tokens visuais passaram a ter fontes comuns;
- o comparativo não permite afirmar com segurança a intenção de produto por trás de pequenos ajustes textuais ou visuais; esses casos foram descritos somente pelo efeito observável no código.
