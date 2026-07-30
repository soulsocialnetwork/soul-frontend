import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Image, Video, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function CreateHighlightPage() {
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipular upload de foto/vídeo local
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedMedia(url);
    }
  };

  // Salvar Destaque e voltar para o Perfil
  const handleSaveHighlight = () => {
    if (!highlightTitle.trim() || !selectedMedia) return;

    const newHighlight = {
      id: `hl-${Date.now()}`,
      name: highlightTitle.trim(),
      cover: selectedMedia,
      image: selectedMedia,
      type: mediaType,
    };

    const existing = JSON.parse(localStorage.getItem('@app:highlights') || '[]');
    const updated = [newHighlight, ...existing];
    localStorage.setItem('@app:highlights', JSON.stringify(updated));

    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full animate-fade-up pb-28 lg:pb-8">
          
          {/* Cabeçalho superior */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-textSecondary hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Criar Destaque
              </h1>
            </div>
          </div>

          {/* Seletor de tipo de mídia */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 w-full max-w-sm">
            <button
              type="button"
              onClick={() => {
                setMediaType('image');
                setSelectedMedia(null);
              }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2',
                mediaType === 'image'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-textSecondary hover:text-white'
              )}
            >
              <Image className="w-4 h-4" /> Foto
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaType('video');
                setSelectedMedia(null);
              }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2',
                mediaType === 'video'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-textSecondary hover:text-white'
              )}
            >
              <Video className="w-4 h-4" /> Vídeo
            </button>
          </div>

          {/* Card principal de criação */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />

              <div className="flex-1 space-y-4">
                {/* Título do destaque no estilo do textarea */}
                <input
                  type="text"
                  placeholder="Nome do Destaque (ex: Viagens, Momentos)..."
                  value={highlightTitle}
                  onChange={(e) => setHighlightTitle(e.target.value)}
                  className="w-full bg-transparent text-lg text-textPrimary placeholder:text-textSecondary/60 focus:outline-none transition-all"
                  autoFocus
                />

                {/* Preview da mídia ou zona de upload */}
                {selectedMedia ? (
                  <div className="relative mt-4 rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                    {mediaType === 'image' ? (
                      <img
                        src={selectedMedia}
                        alt="Preview"
                        className="w-full max-h-[400px] object-cover"
                      />
                    ) : (
                      <video
                        src={selectedMedia}
                        className="w-full max-h-[400px] object-cover"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedMedia(null)}
                      className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                  >
                    {mediaType === 'image' ? (
                      <Image className="w-8 h-8 text-textSecondary group-hover:text-white transition-colors" />
                    ) : (
                      <Video className="w-8 h-8 text-textSecondary group-hover:text-white transition-colors" />
                    )}
                    <span className="text-sm font-medium text-textSecondary group-hover:text-white transition-colors">
                      Selecione {mediaType === 'image' ? 'uma foto' : 'um vídeo'} para a capa
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Barra de ações inferior */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2 text-textSecondary">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 hover:bg-white/5 rounded-full transition-colors"
                  title="Adicionar Mídia"
                >
                  {mediaType === 'image' ? <Image className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 text-sm font-semibold text-textSecondary hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  variant="primary"
                  className="px-8 rounded-full"
                  onClick={handleSaveHighlight}
                  disabled={!highlightTitle.trim() || !selectedMedia}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>

        </main>
      </div>

      <BottomNav />
    </div>
  );
}