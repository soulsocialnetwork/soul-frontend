import { useState, useRef } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Image, Video, X, Camera, Mic, MapPin, Smile } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<'post' | 'soult'>('post');
  const [content, setContent] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // gerencia o upload de mídia (imagem ou vídeo)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  // remove a mídia selecionada do preview
  const removeMedia = () => {
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // simula a publicação e redireciona para o feed
  const handlePublish = () => {
    navigate('/feed');
  };

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
                  placeholder={activeTab === 'post' ? "No que você está pensando?" : "Descreva seu Soult (vídeo curto)..."}
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
                onClick={handlePublish}
                disabled={!content.trim() && !mediaPreview}
              >
                {t('publish', 'Publicar')}
              </Button>
            </div>
          </div>

        </main>
      </div>
      <BottomNav />
    </div>
  );
}