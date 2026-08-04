import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, UserPlus, UserCheck, Grid, X, QrCode, Heart, ScanLine, Loader2 } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { PostCard } from '../../components/feed/PostCard';
import { cn } from '../../utils/cn';
import { userService, type UserProfile } from '../../services/userService';
import type { Post } from '../../services/postService';


const MAX_CONNECTIONS = 50;
const MY_CONNECTIONS_COUNT = 0; 

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectIntent, setConnectIntent] = useState('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [feedModal, setFeedModal] = useState<{ list: Post[]; startIndex: number } | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoadingProfile(true);
    userService.getByUsername(username).then((data) => {
      setUser(data);
      setLoadingProfile(false);
    });
  }, [username]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFeedModal(null);
        setShowAvatarModal(false);
        setShowQrScanModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    const anyModalOpen = feedModal || showAvatarModal || showConnectModal || showQrScanModal;
    document.body.style.overflow = anyModalOpen ? 'hidden' : 'unset';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [feedModal, showAvatarModal, showConnectModal, showQrScanModal]);

  const handleConnectClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      return;
    }
    if (MY_CONNECTIONS_COUNT >= MAX_CONNECTIONS) {
      setShowLimitWarning(true);
    } else {
      setShowConnectModal(true);
    }
  };

  const handleConfirmConnect = () => {
    if (!connectIntent.trim()) return;
    userService.connect(user!.id, connectIntent);
    setIsFollowing(true);
    setShowConnectModal(false);
    setConnectIntent('');
  };

  const handleQrFriendScan = async () => {
    setQrScanning(true);
    const result = await userService.validateFriendQr('mock-token');
    setQrScanning(false);
    if (result.success) {
      setQrSuccess(true);
      setIsFriend(true);
      setTimeout(() => {
        setQrSuccess(false);
        setShowQrScanModal(false);
      }, 2000);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center text-textPrimary gap-4">
        <p className="text-textSecondary">Perfil não encontrado</p>
        <button onClick={() => navigate(-1)} className="text-sm underline text-textSecondary">Voltar</button>
      </div>
    );
  }

  const fullPosts: Post[] = user.posts.map((post, index) => ({
    id: post.id,
    author: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      verified: user.verified,
    },
    content: post.content || '',
    imageUrl: post.imageUrl,
    likesCount: 100 + index * 10,
    commentsCount: 5 + index,
    createdAt: new Date().toISOString(),
  }));

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header com botão voltar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-textPrimary" />
          </button>
          <span className="font-semibold text-sm truncate">{user.username}</span>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
          <div className="w-full max-w-4xl mx-auto pt-4 lg:pt-8 px-4 sm:px-6 space-y-8">

            {/* Perfil Principal */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start w-full">

                {/* Avatar */}
                <div
                  onClick={() => setShowAvatarModal(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 p-1 bg-white/5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover object-top" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
                  
                  {/* Nome + Badges + Ações */}
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-5 w-full md:w-auto">
                    <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto overflow-hidden">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{user.username}</h1>
                      {user.verified && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" strokeWidth={2.5} />}
                      {isFriend && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold shrink-0">
                          <Heart className="w-2.5 h-2.5 fill-rose-400" /> Amigo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      {/* Botão Conectar */}
                      <button
                        onClick={handleConnectClick}
                        className={cn(
                          'flex items-center justify-center gap-2 px-5 h-9 rounded-xl text-[13px] font-semibold transition-all active:scale-95 flex-1 md:flex-none',
                          isFollowing
                            ? 'bg-white/10 text-textPrimary border border-white/10 hover:bg-white/20'
                            : 'bg-white text-black hover:bg-white/90'
                        )}
                      >
                        {isFollowing
                          ? <><UserCheck className="w-4 h-4" /><span>Conectado</span></>
                          : <><UserPlus className="w-4 h-4" /><span>Conectar</span></>
                        }
                      </button>

                      {/* Botão Adicionar Amigo via QR */}
                      <button
                        onClick={() => setShowQrScanModal(true)}
                        title="Adicionar como Amigo Real (QR)"
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border shrink-0',
                          isFriend
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-white/5 border-white/10 text-textSecondary hover:bg-white/10'
                        )}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats — publicações, conexões, amigos */}
                  <div className="flex gap-4 sm:gap-6 justify-center md:justify-start w-full mb-5 text-sm">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">{user.postsCount}</span>
                      <span className="text-textSecondary text-xs mt-1">publicações</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">{user.connectionsCount}</span>
                      <span className="text-textSecondary text-xs mt-1">conexões</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-base sm:text-lg leading-none">{user.friendsCount}</span>
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      </div>
                      <span className="text-textSecondary text-xs mt-1">amigos reais</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1 text-sm text-textSecondary max-w-md w-full px-2 md:px-0">
                    <p className="font-bold text-textPrimary text-[14px] sm:text-[15px]">{user.name}</p>
                    {user.bio.split('\n').map((line, idx) => (
                      <p key={idx} className="leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Posts */}
            <div className="flex justify-center border-b border-white/10 mb-6 gap-8 px-4">
              <button className="pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px] border-white text-white">
                <Grid className="w-4 h-4" />
                <span>Posts</span>
              </button>
            </div>

            {/* Grade de Fotos */}
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {fullPosts.map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => setFeedModal({ list: fullPosts, startIndex: index })}
                  className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center relative group"
                >
                  <img src={post.imageUrl} alt={`Post ${index}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      <BottomNav />

      {/* Modal: Foto do Perfil */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAvatarModal(false)}>
          <button onClick={() => setShowAvatarModal(false)} className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
            <X className="w-6 h-6" />
          </button>
          <img src={user.avatarUrl} alt="Foto de perfil" onClick={(e) => e.stopPropagation()} className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-[2rem] object-cover shadow-2xl border border-white/10 animate-scale-up" />
        </div>
      )}

      {/* Modal: Feed de Posts */}
      {feedModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-fade-in">
          <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Publicações</span>
            <button onClick={() => setFeedModal(null)} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar py-6 pb-24">
            <div className="max-w-lg mx-auto space-y-6 sm:px-4">
              {feedModal.list.slice(feedModal.startIndex).concat(feedModal.list.slice(0, feedModal.startIndex)).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Conexão com Propósito */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setShowConnectModal(false)}>
          <div className="bg-[#1c1c1f] border border-white/10 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 mb-4">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Conexão com Propósito</h2>
            <p className="text-sm text-zinc-400 mb-6">Por que você deseja se conectar com {user.name}?</p>
            <textarea
              value={connectIntent}
              onChange={e => setConnectIntent(e.target.value)}
              placeholder="Ex: Me inspira, amigo real, mesmos interesses..."
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-none h-24 mb-6"
            />
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => setShowConnectModal(false)} className="flex-1 py-3 bg-transparent text-white border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleConfirmConnect}
                disabled={!connectIntent.trim()}
                className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Aviso de Limite de Conexões */}
      {showLimitWarning && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLimitWarning(false)}>
          <div className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Limite de Conexões</h3>
              <button onClick={() => setShowLimitWarning(false)} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Você já acompanha <strong className="text-white">{MY_CONNECTIONS_COUNT} pessoas</strong>. Adicionar mais pode fragmentar sua atenção e reduzir a qualidade das suas conexões reais.
            </p>
            <div className="space-y-3">
              <button onClick={() => { setShowLimitWarning(false); setShowConnectModal(true); }} className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all active:scale-[0.98]">
                Conectar mesmo assim
              </button>
              <button onClick={() => setShowLimitWarning(false)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98]">
                Entendi — manter foco
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar como Amigo Real via QR */}
      {showQrScanModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => !qrScanning && setShowQrScanModal(false)}>
          <div className="w-full max-w-xs bg-background border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-5 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
            {!qrSuccess ? (
              <>
                <button onClick={() => setShowQrScanModal(false)} className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Amigo Real</h3>
                  <p className="text-xs text-zinc-400">Peça para <strong className="text-white">@{user.username}</strong> abrir o QR dele e aponte a câmera</p>
                </div>

                {/* Área de scan simulada */}
                <div className="w-44 h-44 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center bg-white/[0.02] relative overflow-hidden">
                  <ScanLine className="w-8 h-8 text-white/30 mb-2" />
                  <span className="text-xs text-zinc-600">Área de escaneamento</span>
                  {/* Linha de scan animada */}
                  <div className="absolute left-0 right-0 h-0.5 bg-white/40 animate-bounce" style={{ top: '50%' }} />
                </div>

                <p className="text-xs text-zinc-500 text-center">
                  Amizade só é confirmada quando <strong className="text-zinc-300">os dois</strong> escanear mutuamente. Nenhum lado pode adicionar sem consentimento.
                </p>

                <button
                  onClick={handleQrFriendScan}
                  disabled={qrScanning}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {qrScanning ? <><Loader2 className="w-4 h-4 animate-spin" />Validando...</> : <><QrCode className="w-4 h-4" />Escanear QR Code</>}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Amizade Confirmada!</h3>
                  <p className="text-xs text-zinc-400">Vocês dois são amigos reais agora.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}