import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Image, Video, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { postService } from '../../services/postService';
import { api, getHttpErrorMessage } from '../../services/api';

export default function CreateHighlightPage() {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) { setSelectedMedia(null); return; }
    const url = URL.createObjectURL(file);
    setSelectedMedia(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    event.target.value = '';
    if (!next) return;
    if (!next.type.startsWith(mediaType + '/') || next.size > 20 * 1024 * 1024) {
      setSaveError('Selecione uma mídia do tipo escolhido com até 20 MB.');
      return;
    }
    setSaveError('');
    setFile(next);
  };

  const handleSaveHighlight = async () => {
    if (!highlightTitle.trim() || !file || saving) return;
    setSaveError('');
    setSaving(true);
    try {
      const coverUrl = await postService.uploadMedia(file);
      await api.post('/highlights', { title: highlightTitle.trim(), coverUrl });
      navigate('/profile');
    } catch (error) {
      setSaveError(getHttpErrorMessage(error));
    } finally {
      setSaving(false);
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
              disabled={saving}
              aria-pressed={mediaType === 'image'}
              onClick={() => { setMediaType('image'); setFile(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
                mediaType === 'image' ? 'bg-white/10 text-white' : 'text-textSecondary hover:text-white'
              )}
            >
              <Image className="w-4 h-4" /> Foto
            </button>
            <button
              type="button"
              disabled={saving}
              aria-pressed={mediaType === 'video'}
              onClick={() => { setMediaType('video'); setFile(null); }}
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
            aria-label="Nome do destaque"
            maxLength={30}
            disabled={saving}
            placeholder="Dê um nome ao seu destaque..."
            value={highlightTitle}
            onChange={(e) => setHighlightTitle(e.target.value)}
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-textPrimary placeholder:text-textSecondary/40 focus:outline-none transition-all pb-4 border-b border-white/5 mb-6"
            autoFocus
          />

          {/* Preview ou zona de upload */}
          {selectedMedia ? (
            <div className="soul-squircle-card relative overflow-hidden bg-black/40 border border-white/10 group">
              {mediaType === 'image' ? (
                <SecureImage src={selectedMedia} alt="Preview" className="w-full max-h-[400px] object-cover" />
              ) : (
                <SecureVideo src={selectedMedia} className="w-full max-h-[400px] object-cover" controls />
              )}
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remover mídia selecionada"
                disabled={saving}
                className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button type="button"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group min-h-[280px]"
            >
              {mediaType === 'image' ? (
                <Image className="w-8 h-8 text-textSecondary group-hover:text-white transition-colors" />
              ) : (
                <Video className="w-8 h-8 text-textSecondary group-hover:text-white transition-colors" />
              )}
              <span className="text-sm font-medium text-textSecondary group-hover:text-white transition-colors">
                Toque para selecionar {mediaType === 'image' ? 'uma foto' : 'um vídeo'}
              </span>
            </button>
          )}

          <input
            type="file"
            disabled={saving}
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
                disabled={saving || !highlightTitle.trim() || !file}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              {saveError && (
                <p role="alert" className="text-red-400/80 text-xs text-center mt-1">{saveError}</p>
              )}
            </div>
          </div>

        </main>
      </div>

      <BottomNav />
    </div>
  );
}
