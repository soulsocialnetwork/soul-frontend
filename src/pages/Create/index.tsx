import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import {
  Image, X, Tag, ChevronDown,
  Book, Palette, MessageSquare, HandHeart,
  Leaf, Music, Smile, Plane, Utensils,
  BookOpen, Heart, Laptop, Trophy,
  Users, Sun, Archive, Globe,
  Video, User
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { postService } from '../../services/postService';
import { soultService } from '../../services/soultService';
import { getHttpErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ALL_CATEGORIES = [
  { id: 'knowledge', label: 'Conhecimento', icon: <Book className="w-5 h-5 text-white" /> },
  { id: 'art', label: 'Arte & Criatividade', icon: <Palette className="w-5 h-5 text-white" /> },
  { id: 'reflection', label: 'Reflexão', icon: <MessageSquare className="w-5 h-5 text-white" /> },
  { id: 'help', label: 'Dúvida & Ajuda', icon: <HandHeart className="w-5 h-5 text-white" /> },
  { id: 'nature', label: 'Natureza', icon: <Leaf className="w-5 h-5 text-white" /> },
  { id: 'music', label: 'Música', icon: <Music className="w-5 h-5 text-white" /> },
  { id: 'wellness', label: 'Bem-estar', icon: <Smile className="w-5 h-5 text-white" /> },
  { id: 'travel', label: 'Viagem', icon: <Plane className="w-5 h-5 text-white" /> },
  { id: 'food', label: 'Gastronomia', icon: <Utensils className="w-5 h-5 text-white" /> },
  { id: 'books', label: 'Livros & Leitura', icon: <BookOpen className="w-5 h-5 text-white" /> },
  { id: 'gratitude', label: 'Gratidão', icon: <Heart className="w-5 h-5 text-white" /> },
  { id: 'humor', label: 'Humor', icon: <Smile className="w-5 h-5 text-white" /> },
  { id: 'technology', label: 'Tecnologia', icon: <Laptop className="w-5 h-5 text-white" /> },
  { id: 'sports', label: 'Esportes', icon: <Trophy className="w-5 h-5 text-white" /> },
  { id: 'community', label: 'Comunidade', icon: <Users className="w-5 h-5 text-white" /> },
  { id: 'moment', label: 'Momento do Dia', icon: <Sun className="w-5 h-5 text-white" /> },
  { id: 'memory', label: 'Memória', icon: <Archive className="w-5 h-5 text-white" /> },
  { id: 'cause', label: 'Causa Social', icon: <Globe className="w-5 h-5 text-white" /> },
];

type CreateMode = 'post' | 'soult';

export default function CreatePage() {
  const [mode, setMode] = useState<CreateMode>('post');

  // Post state
  const [content, setContent] = useState('');
  const MAX_CHARS = 500;
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [soultFile, setSoultFile] = useState<File | null>(null);
  const [intention, setIntention] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Soult (video) state
  const [soultVideo, setSoultVideo] = useState<string | null>(null);
  const [soultCaption, setSoultCaption] = useState('');

  // Shared state
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmTimer, setConfirmTimer] = useState(3);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const soultFileInputRef = useRef<HTMLInputElement>(null);

  // Reset when switching modes
  const handleModeChange = (newMode: CreateMode) => {
    setMode(newMode);
    setIsConfirming(false);
    setPublishError('');
  };

  function handleMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleSoultFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSoultFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSoultVideo(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const handleRequestPublish = () => {
    setIsConfirming(true);
    setConfirmTimer(3);
  };

  useEffect(() => {
    if (!isConfirming) return;
    if (confirmTimer <= 0) return;
    const id = setTimeout(() => setConfirmTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [isConfirming, confirmTimer]);

  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    setPublishError('');
    try {
      if (mode === 'post') {
        let imageUrl: string | undefined = undefined;
        if (mediaFile) {
          imageUrl = await postService.uploadMedia(mediaFile);
        }
        await postService.createPost({
          content: content.trim(),
          imageUrl,
          category: intention || undefined,
        });
      } else {
        let videoUrl: string | undefined = undefined;
        if (soultFile) {
          videoUrl = await postService.uploadMedia(soultFile);
        }
        if (!videoUrl) throw new Error('Falha ao enviar vídeo');
        await soultService.createSoult({
          caption: soultCaption.trim(),
          videoUrl: videoUrl,
          category: intention || undefined,
        });
      }
      setIsConfirming(false);
      navigate('/feed');
    } catch (error) {
      setPublishError(getHttpErrorMessage(error));
      setIsConfirming(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedCategory = ALL_CATEGORIES.find(c => c.id === intention);

  const canPublishPost = (content.trim().length > 0 || mediaPreview) && !!intention;
  const canPublishSoult = !!soultVideo && !!intention;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full animate-fade-up pb-28 lg:pb-8">

          {/* Mode switcher */}
          <div className="flex p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl mb-8 w-full max-w-xs">
            <button
              onClick={() => handleModeChange('post')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                mode === 'post' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
              )}
            >
              <Image className="w-4 h-4" />
              Post
            </button>
            <button
              onClick={() => handleModeChange('soult')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                mode === 'soult' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
              )}
            >
              <Video className="w-4 h-4" />
              Soult
            </button>
          </div>

          {/* ── POST MODE ── */}
          {mode === 'post' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex gap-4 flex-1">
                <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden bg-white/5 border border-white/10 mt-1 flex items-center justify-center text-white/50">
                  {user?.profilePicture ? (
                    <SecureImage src={user.profilePicture} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    value={content}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) setContent(e.target.value);
                    }}
                    placeholder="O que você gostaria de compartilhar com calma?"
                    className="w-full bg-transparent text-xl sm:text-2xl text-textPrimary placeholder:text-textSecondary/40 focus:outline-none resize-none flex-1 min-h-[160px]"
                  />
                  {/* Contador de caracteres */}
                  <div className="flex justify-end mt-1 mb-2">
                    <span className={cn(
                      'text-xs tabular-nums transition-colors',
                      content.length >= MAX_CHARS
                        ? 'text-red-400 font-semibold'
                        : content.length >= MAX_CHARS * 0.8
                        ? 'text-amber-400'
                        : 'text-white/20'
                    )}>
                      {content.length}/{MAX_CHARS}
                    </span>
                  </div>

                  {mediaPreview && (
                    <div className="relative mt-4 rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                      {mediaPreview.startsWith('data:video') || mediaPreview.match(/\.(mp4|webm|ogg)$/i) ? (
                        <SecureVideo src={mediaPreview} className="w-full max-h-[400px] object-cover" controls />
                      ) : (
                        <SecureImage src={mediaPreview} alt="Preview" className="w-full max-h-[400px] object-cover" />
                      )}
                      <button
                        onClick={() => setMediaPreview(null)}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Post action bar */}
              <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200',
                      intention
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                    )}
                  >
                    <Tag className="w-4 h-4 shrink-0" />
                    <span>{selectedCategory ? selectedCategory.label : 'Intenção'}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={() => mediaFileInputRef.current?.click()}
                    className="flex items-center justify-center w-10 h-10 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                    title="Adicionar foto/vídeo"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  className="px-8 py-3.5 rounded-xl font-bold"
                  onClick={handleRequestPublish}
                  disabled={!canPublishPost}
                >
                  {t('publish', 'Publicar')}
                </Button>
              </div>

              <input ref={mediaFileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaFileChange} />
            </div>
          )}

          {/* ── SOULT MODE ── */}
          {mode === 'soult' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex gap-4 flex-1">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden bg-white/5 border border-white/10 mt-1 flex items-center justify-center text-white/50">
                  {user?.profilePicture ? (
                    <SecureImage src={user.profilePicture} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    value={soultCaption}
                    onChange={(e) => setSoultCaption(e.target.value)}
                    placeholder="O que aconteceu nesse momento?"
                    className="w-full bg-transparent text-xl sm:text-2xl text-textPrimary placeholder:text-textSecondary/40 focus:outline-none resize-none flex-1 min-h-[120px]"
                  />

                  {/* Video preview inline */}
                  {soultVideo ? (
                    <div className="relative mt-4 rounded-2xl overflow-hidden bg-black group max-w-[280px]">
                      <SecureVideo
                        src={soultVideo}
                        className="w-full aspect-[9/16] object-cover"
                        controls
                        playsInline
                      />
                      <button
                        onClick={() => setSoultVideo(null)}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Soult action bar — mirrors Post action bar */}
              <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200',
                      intention
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-transparent border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                    )}
                  >
                    <Tag className="w-4 h-4 shrink-0" />
                    <span>{selectedCategory ? selectedCategory.label : 'Intenção'}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={() => soultFileInputRef.current?.click()}
                    className="flex items-center justify-center w-10 h-10 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                    title="Selecionar vídeo"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  className="px-8 py-3.5 rounded-xl font-bold"
                  onClick={handleRequestPublish}
                  disabled={!canPublishSoult}
                >
                  Publicar Soult
                </Button>
              </div>

              <input ref={soultFileInputRef} type="file" accept="video/*" className="hidden" onChange={handleSoultFileChange} />
            </div>
          )}

        </main>
      </div>
      <BottomNav />

      {/* Modal de Categorias (apenas para Post) */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="w-full max-w-sm flex flex-col gap-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Categoria da publicação</h3>
              <p className="text-xs text-zinc-400">O que você está compartilhando?</p>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="absolute -top-1 -right-2 p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setIntention(cat.id); setShowCategoryModal(false); }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-200 active:scale-95',
                    intention === cat.id
                      ? 'bg-white/15 border-white/25 text-white'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/10'
                  )}
                >
                  <span className="flex items-center justify-center mb-1">{cat.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tela de fricção reflexiva antes de publicar */}
      {isConfirming && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm text-center space-y-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                {mode === 'soult' ? (
                  <Video className="w-7 h-7 text-zinc-300" />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'soult' ? 'Publicar este Soult?' : 'Um momento antes de publicar'}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {mode === 'soult'
                  ? 'Seu vídeo será compartilhado com seus seguidores.'
                  : 'Este post reflete seus valores? Ele contribui para alguém ou é um impulso do momento?'}
              </p>
            </div>

            {mode === 'post' && selectedCategory && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-zinc-500 mb-1">Categoria selecionada</p>
                <p className="text-sm font-semibold text-white">{selectedCategory.label}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                disabled={confirmTimer > 0 || isPublishing}
                onClick={handleConfirmPublish}
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 active:scale-[0.98]"
              >
                {isPublishing ? 'Publicando...' : confirmTimer > 0 ? `Publicar em ${confirmTimer}s…` : 'Sim, publicar agora'}
              </button>
              {publishError && <p className="text-xs text-red-400 text-center">{publishError}</p>}
              <button
                onClick={() => setIsConfirming(false)}
                className="w-full py-3.5 bg-transparent border border-white/10 text-zinc-400 font-semibold rounded-xl hover:border-white/20 hover:text-white transition-all"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}