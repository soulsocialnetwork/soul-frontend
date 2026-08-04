import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Image, Video, X, Camera, Mic, MapPin, Smile, Tag, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';

const ALL_CATEGORIES = [
  { id: 'knowledge', label: 'Conhecimento', icon: '📚' },
  { id: 'art', label: 'Arte & Criatividade', icon: '🎨' },
  { id: 'reflection', label: 'Reflexão', icon: '💭' },
  { id: 'help', label: 'Dúvida & Ajuda', icon: '🤝' },
  { id: 'nature', label: 'Natureza', icon: '🌿' },
  { id: 'music', label: 'Música', icon: '🎵' },
  { id: 'wellness', label: 'Bem-estar', icon: '🧘' },
  { id: 'travel', label: 'Viagem', icon: '✈️' },
  { id: 'food', label: 'Gastronomia', icon: '🍽️' },
  { id: 'books', label: 'Livros & Leitura', icon: '📖' },
  { id: 'gratitude', label: 'Gratidão', icon: '🙏' },
  { id: 'humor', label: 'Humor', icon: '😄' },
  { id: 'technology', label: 'Tecnologia', icon: '💻' },
  { id: 'sports', label: 'Esportes', icon: '⚽' },
  { id: 'community', label: 'Comunidade', icon: '🏘️' },
  { id: 'moment', label: 'Momento do Dia', icon: '☀️' },
  { id: 'memory', label: 'Memória', icon: '🗂️' },
  { id: 'cause', label: 'Causa Social', icon: '🌍' },
];

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<'post' | 'soult'>('post');
  const [content, setContent] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [intention, setIntention] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmTimer, setConfirmTimer] = useState(3);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleConfirmPublish = () => {
    setIsConfirming(false);
    navigate('/feed');
  };

  const selectedCategory = ALL_CATEGORIES.find(c => c.id === intention);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full animate-fade-up pb-28 lg:pb-8">
          
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{t('create.title', 'Criar')}</h1>
          </div>

          {/* seletor de tipo de publicação */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 w-full max-w-sm">
            <button
              onClick={() => setActiveTab('post')}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                activeTab === 'post' ? "bg-white/10 text-white shadow-sm" : "text-textSecondary hover:text-white"
              )}
            >
              Publicação
            </button>
            <button
              onClick={() => setActiveTab('soult')}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                activeTab === 'soult' ? "bg-white/10 text-white shadow-sm" : "text-textSecondary hover:text-white"
              )}
            >
              Soult (Vídeo)
            </button>
          </div>

          {/* card principal de criação */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
              
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={activeTab === 'post' ? "O que você gostaria de compartilhar com calma?" : "Descreva seu Soult com intenção..."}
                  className="w-full bg-transparent text-lg text-textPrimary placeholder:text-textSecondary/60 focus:outline-none resize-none min-h-[120px]"
                />

                {mediaPreview && (
                  <div className="relative mt-4 rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                    {activeTab === 'post' ? (
                      <img src={mediaPreview} alt="Preview" className="w-full max-h-[400px] object-cover" />
                    ) : (
                      <video src={mediaPreview} className="w-full max-h-[400px] object-cover" controls />
                    )}
                    <button 
                      onClick={removeMedia}
                      className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Seletor de Categoria / Intenção */}
            <div className="mt-6 mb-2">
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-widest mb-3">Qual a intenção desta publicação?</p>
              
              <button
                onClick={() => setShowCategoryModal(true)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 text-left",
                  intention
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-textSecondary hover:border-white/20 hover:text-white"
                )}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span className="flex-1">
                  {selectedCategory
                    ? `${selectedCategory.icon} ${selectedCategory.label}`
                    : 'Selecionar categoria…'}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-textSecondary" />
              </button>
            </div>

            {/* barra de ações inferiores */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2 text-textSecondary">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 hover:bg-white/5 rounded-full transition-colors tooltip-trigger"
                  title="Adicionar Mídia"
                >
                  {activeTab === 'post' ? <Image className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept={activeTab === 'post' ? "image/*" : "video/*"}
                  onChange={handleMediaUpload}
                />
                
                <button className="p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
                  <Camera className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
                  <MapPin className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-white/5 rounded-full transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <Button 
                variant="primary" 
                className="px-8 rounded-full"
                onClick={handleRequestPublish}
                disabled={(!content.trim() && !mediaPreview) || !intention}
              >
                {t('publish', 'Publicar')}
              </Button>
            </div>
          </div>

        </main>
      </div>
      <BottomNav />

      {/* Modal de Categorias */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl animate-scale-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Categoria da publicação</h3>
                <p className="text-xs text-textSecondary mt-0.5">O que você está compartilhando?</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-textSecondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setIntention(cat.id);
                    setShowCategoryModal(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 text-left active:scale-95",
                    intention === cat.id
                      ? "bg-white/15 border-white/25 text-white"
                      : "bg-white/5 border-white/10 text-textSecondary hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tela de Fricção Reflexiva antes de publicar */}
      {isConfirming && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm text-center space-y-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Um momento antes de publicar</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Este post reflete seus valores? Ele contribui para alguém ou é um impulso do momento?
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Categoria selecionada</p>
              <p className="text-sm font-semibold text-white">
                {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : intention}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={confirmTimer > 0}
                onClick={handleConfirmPublish}
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 active:scale-[0.98]"
              >
                {confirmTimer > 0 ? `Publicar em ${confirmTimer}s…` : 'Sim, publicar agora'}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="w-full py-3.5 bg-transparent border border-white/10 text-zinc-400 font-semibold rounded-xl hover:border-white/20 hover:text-white transition-all"
              >
                Revisar novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}