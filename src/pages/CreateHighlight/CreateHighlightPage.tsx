import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Image, Video, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

export default function CreateHighlightPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function compressImage(dataUrl: string, maxDim = 320, quality = 0.6): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const raw = ev.target?.result as string;
        if (mediaType === 'image') {
          const compressed = await compressImage(raw);
          setSelectedMedia(compressed);
        } else {
          setSelectedMedia(raw);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHighlight = () => {
    if (!highlightTitle.trim() || !selectedMedia) return;
    setSaveError('');

    const newHighlight = {
      id: `hl-${Date.now()}`,
      name: highlightTitle.trim(),
      cover: selectedMedia,
      image: selectedMedia,
      type: mediaType,
    };

    const key = `@app:highlights_${user?.username || 'guest'}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [newHighlight, ...existing];
      localStorage.setItem(key, JSON.stringify(updated));
      navigate('/profile');
    } catch {
      setSaveError('Espaço insuficiente. Remova destaques antigos e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full animate-fade-up pb-28 lg:pb-8">

          {/* Cabeçalho superior */}
          <div className="mb-6 flex items-center gap-3">
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

          {/* Seletor de tipo de mídia */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-8 w-full max-w-xs">
            <button
              type="button"
              onClick={() => { setMediaType('image'); setSelectedMedia(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
                mediaType === 'image' ? 'bg-white/10 text-white' : 'text-textSecondary hover:text-white'
              )}
            >
              <Image className="w-4 h-4" /> Foto
            </button>
            <button
              type="button"
              onClick={() => { setMediaType('video'); setSelectedMedia(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
                mediaType === 'video' ? 'bg-white/10 text-white' : 'text-textSecondary hover:text-white'
              )}
            >
              <Video className="w-4 h-4" /> Vídeo
            </button>
          </div>

          {/* Nome do destaque */}
          <input
            type="text"
            placeholder="Dê um nome ao seu destaque..."
            value={highlightTitle}
            onChange={(e) => setHighlightTitle(e.target.value)}
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-textPrimary placeholder:text-textSecondary/40 focus:outline-none transition-all pb-4 border-b border-white/5 mb-6"
            autoFocus
          />

          {/* Preview ou zona de upload */}
          {selectedMedia ? (
            <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
              {mediaType === 'image' ? (
                <SecureImage src={selectedMedia} alt="Preview" className="w-full max-h-[400px] object-cover" />
              ) : (
                <SecureVideo src={selectedMedia} className="w-full max-h-[400px] object-cover" controls />
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
              className="rounded-2xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group min-h-[280px]"
            >
              {mediaType === 'image' ? (
                <Image className="w-8 h-8 text-textSecondary group-hover:text-white transition-colors" />
              ) : (
                <Video className="w-8 h-8 text-textSecondary group-hover:text-white transition-colors" />
              )}
              <span className="text-sm font-medium text-textSecondary group-hover:text-white transition-colors">
                Toque para selecionar {mediaType === 'image' ? 'uma foto' : 'um vídeo'}
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

          {/* Barra de ações inferior */}
          <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-10 h-10 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              title="Trocar mídia"
            >
              {mediaType === 'image' ? <Image className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

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
                className="px-8 py-3.5 rounded-xl font-bold shadow-lg"
                onClick={handleSaveHighlight}
                disabled={!highlightTitle.trim() || !selectedMedia}
              >
                Salvar
              </Button>
              {saveError && (
                <p className="text-red-400/80 text-xs text-center mt-1">{saveError}</p>
              )}
            </div>
          </div>

        </main>
      </div>

      <BottomNav />
    </div>
  );
}