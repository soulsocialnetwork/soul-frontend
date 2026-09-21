import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { CameraCapture } from '../../components/ui/CameraCapture';
import { Camera, Image, X, Tag, ChevronDown, Video, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { postService } from '../../services/postService';
import { soultService } from '../../services/soultService';
import { getHttpErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { validateUploadFile } from '../../utils/mediaValidation';
import { SOUL_CATEGORIES } from '../../constants/categories';

type CreateMode = 'post' | 'soult';

const MAX_SOULT_CAPTION_CHARS = 150;
const MAX_SOULT_DURATION_SECONDS = 300;

// gerencia criação, validação, preview e publicação de posts e soults
export default function CreatePage() {
  const [mode, setMode] = useState<CreateMode>('post');

  const [content, setContent] = useState('');
  const MAX_CHARS = 500;
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [soultFile, setSoultFile] = useState<File | null>(null);
  const [soultDuration, setSoultDuration] = useState<number | undefined>();
  const [intention, setIntention] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [soultVideo, setSoultVideo] = useState<string | null>(null);
  const [soultCaption, setSoultCaption] = useState('');

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmTimer, setConfirmTimer] = useState(3);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const soultFileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: CreateMode) => {
    setMode(newMode);
    setIsConfirming(false);
    setPublishError('');
  };

  function handleMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateUploadFile(file, 'any', 50);
    if (validationError) { setPublishError(validationError); e.target.value = ''; return; }
    setPublishError('');
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  function handleSoultFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateUploadFile(file, 'video', 50);
    if (validationError) { setPublishError(validationError); e.target.value = ''; return; }
    const previewUrl = URL.createObjectURL(file);
    const metadataUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      URL.revokeObjectURL(metadataUrl);
      if (!Number.isFinite(probe.duration) || probe.duration <= 0) {
        setPublishError('Não foi possível identificar a duração do vídeo.');
        URL.revokeObjectURL(previewUrl);
        return;
      }
      if (probe.duration > MAX_SOULT_DURATION_SECONDS) {
        setPublishError('O Soult pode ter no máximo 5 minutos.');
        URL.revokeObjectURL(previewUrl);
        return;
      }
      setPublishError('');
      setSoultDuration(Math.ceil(probe.duration));
      setSoultFile(file);
      setSoultVideo(previewUrl);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(metadataUrl);
      URL.revokeObjectURL(previewUrl);
      setPublishError('Não foi possível ler este vídeo.');
    };
    probe.src = metadataUrl;
    e.target.value = '';
  }

  useEffect(() => () => { if (mediaPreview) URL.revokeObjectURL(mediaPreview); }, [mediaPreview]);
  useEffect(() => () => { if (soultVideo) URL.revokeObjectURL(soultVideo); }, [soultVideo]);

  const handleCameraCapture = (file: File) => {
    setPublishError('');
    if (cameraMode === 'photo') {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setSoultFile(file);
      setSoultVideo(URL.createObjectURL(file));
      setSoultDuration(undefined);
    }
    setCameraMode(null);
  };

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
    if (mode === 'soult' && soultCaption.trim().length > MAX_SOULT_CAPTION_CHARS) {
      setPublishError(`A legenda pode ter no máximo ${MAX_SOULT_CAPTION_CHARS} caracteres.`);
      setIsConfirming(false);
      return;
    }
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
          duration: soultDuration,
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

  const selectedCategory = SOUL_CATEGORIES.find(c => c.id === intention);

  const canPublishPost = (content.trim().length > 0 || mediaPreview) && !!intention;
  const canPublishSoult = !!soultVideo && !!intention;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full animate-fade-up pb-28 lg:pb-8">

          <div className="flex p-1 soul-glass rounded-xl mb-8 w-full max-w-xs">
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

          {mode === 'post' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex gap-4 flex-1">
                <div className="rounded-lg w-11 h-11 flex-shrink-0 overflow-hidden bg-neutral-800 mt-1 flex items-center justify-center text-white/50">
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
                      {mediaFile?.type.startsWith('video/') ? (
                        <SecureVideo src={mediaPreview} className="w-full max-h-[400px] object-cover" controls />
                      ) : (
                        <SecureImage src={mediaPreview} alt="Preview" className="w-full max-h-[400px] object-cover" />
                      )}
                      <button
                        onClick={() => { setMediaPreview(null); setMediaFile(null); }}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

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
                  <button type="button" onClick={() => setCameraMode('photo')} className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" title="Tirar foto" aria-label="Tirar foto pela câmera">
                    <Camera className="w-5 h-5" />
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

              <input ref={mediaFileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm" className="hidden" onChange={handleMediaFileChange} />
            </div>
          )}

          {mode === 'soult' && (
            <div className="flex-1 flex flex-col relative">
              <div className="flex gap-4 flex-1">
                <div className="rounded-lg w-11 h-11 flex-shrink-0 overflow-hidden bg-neutral-800 mt-1 flex items-center justify-center text-white/50">
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
                    maxLength={MAX_SOULT_CAPTION_CHARS}
                    placeholder="O que aconteceu nesse momento?"
                    className="w-full bg-transparent text-xl sm:text-2xl text-textPrimary placeholder:text-textSecondary/40 focus:outline-none resize-none flex-1 min-h-[120px]"
                  />
                  <span className="mt-1 self-end text-xs text-textSecondary/60">
                    {soultCaption.length}/{MAX_SOULT_CAPTION_CHARS}
                  </span>

                  {soultVideo ? (
                    <div className="relative mt-4 rounded-2xl overflow-hidden bg-black group max-w-[280px]">
                      <SecureVideo
                        src={soultVideo}
                        className="w-full aspect-[9/16] object-cover"
                        controls
                        playsInline
                      />
                      <button
                        onClick={() => { setSoultVideo(null); setSoultFile(null); }}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

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
                  <button type="button" onClick={() => setCameraMode('video')} className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" title="Gravar vídeo" aria-label="Gravar vídeo pela câmera">
                    <Camera className="w-5 h-5" />
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

              <input ref={soultFileInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleSoultFileChange} />
            </div>
          )}

          {publishError && <p role="alert" className="mt-4 text-center text-sm text-red-400">{publishError}</p>}

        </main>
      </div>
      <BottomNav />

      {cameraMode && <CameraCapture mode={cameraMode} onCapture={handleCameraCapture} onClose={() => setCameraMode(null)} />}

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
              {SOUL_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => { setIntention(category.id); setShowCategoryModal(false); }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-200 active:scale-95',
                      intention === category.id
                        ? 'bg-white/15 border-white/25 text-white'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/10'
                    )}
                  >
                    <span className="flex items-center justify-center mb-1"><CategoryIcon className="w-5 h-5" /></span>
                    <span className="text-xs font-semibold leading-tight">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isConfirming && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm text-center space-y-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl soul-glass flex items-center justify-center mx-auto">
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
              <div className="soul-glass rounded-2xl p-4">
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
