import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { CameraCapture } from '../../components/ui/CameraCapture';
import { Camera, Image, Video, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { postService } from '../../services/postService';
import { api, getHttpErrorMessage } from '../../services/api';
import { validateUploadFile } from '../../utils/mediaValidation';

export default function CreateHighlightPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id: editingId } = useParams<{ id: string }>();
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;
    api.get<Array<{ id: string; title: string; coverUrl: string; mediaUrls?: string[] }>>('/highlights/me')
      .then(({ data }) => {
        if (cancelled) return;
        const item = data.find(highlight => highlight.id === editingId);
        if (!item) { setSaveError('Destaque não encontrado.'); return; }
        setHighlightTitle(item.title);
        setExistingUrls(item.mediaUrls?.length ? item.mediaUrls : [item.coverUrl]);
      })
      .catch(error => { if (!cancelled) setSaveError(getHttpErrorMessage(error)); });
    return () => { cancelled = true; };
  }, [editingId]);

  useEffect(() => {
    if (!files[0]) { setSelectedMedia(null); return; }
    const url = URL.createObjectURL(files[0]);
    setSelectedMedia(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files || []);
    event.target.value = '';
    if (!next.length) return;
    if (existingUrls.length + files.length + next.length > 10) { setSaveError('Um destaque aceita até 10 mídias.'); return; }
    for (const file of next) {
      const validationError = validateUploadFile(file, file.type.startsWith('video/') ? 'video' : 'image', 20);
      if (validationError) { setSaveError(validationError); return; }
    }
    setSaveError('');
    setFiles(current => [...current, ...next]);
  };

  const handleCameraCapture = (captured: File) => {
    setCameraOpen(false);
    const validationError = validateUploadFile(captured, mediaType, 20);
    if (validationError) { setSaveError(validationError); return; }
    setSaveError('');
    if (existingUrls.length + files.length >= 10) { setSaveError('Um destaque aceita até 10 mídias.'); return; }
    setFiles(current => [...current, captured]);
  };

  const handleSaveHighlight = async () => {
    if (!highlightTitle.trim() || existingUrls.length + files.length === 0 || saving) return;
    setSaveError('');
    setSaving(true);
    try {
      const mediaUrls = [...existingUrls];
      for (const file of files) mediaUrls.push(await postService.uploadMedia(file));
      if (editingId) await api.put(`/highlights/${encodeURIComponent(editingId)}`, { title: highlightTitle.trim(), coverUrl: mediaUrls[0], mediaUrls });
      else await api.post('/highlights', { title: highlightTitle.trim(), coverUrl: mediaUrls[0], mediaUrls });
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

          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-textSecondary hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {editingId ? 'Editar Destaque' : 'Criar Destaque'}
            </h1>
          </div>

          <div className="flex p-1 bg-white/5 rounded-xl mb-8 w-full max-w-xs">
            <button
              type="button"
              disabled={saving}
              aria-pressed={mediaType === 'image'}
              onClick={() => setMediaType('image')}
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
              onClick={() => setMediaType('video')}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
                mediaType === 'video' ? 'bg-white/10 text-white' : 'text-textSecondary hover:text-white'
              )}
            >
              <Video className="w-4 h-4" /> Vídeo
            </button>
          </div>

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

          {(selectedMedia || existingUrls[0]) ? (
            <div className="rounded-lg relative overflow-hidden bg-black/40 border border-white/10 group">
              {files[0]?.type.startsWith('image/') || (!files[0] && !/[.](mp4|webm)(?:[?#]|$)/i.test(existingUrls[0])) ? (
                <SecureImage src={selectedMedia || existingUrls[0]} alt="Preview" className="w-full max-h-[400px] object-cover" />
              ) : (
                <SecureVideo src={selectedMedia || existingUrls[0]} className="w-full max-h-[400px] object-cover" controls />
              )}
              <button
                type="button"
                onClick={() => files.length ? setFiles(current => current.slice(1)) : setExistingUrls(current => current.slice(1))}
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

          {existingUrls.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Mídias já salvas">
            {existingUrls.map((url, index) => <div key={url} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
              <span>{index + 1}. Mídia salva</span><button type="button" disabled={saving} onClick={() => setExistingUrls(current => current.filter(item => item !== url))} aria-label={`Remover mídia ${index + 1}`}><X size={14} /></button>
            </div>)}
          </div>}

          {files.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Mídias do destaque">
            {files.map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
              <span className="max-w-32 truncate">{index + 1}. {item.name}</span>
              <button type="button" disabled={saving} onClick={() => setFiles(current => current.filter((_, position) => position !== index))} aria-label={`Remover ${item.name}`} className="text-white/60 hover:text-white"><X size={14} /></button>
            </div>)}
          </div>}

          <input
            type="file"
            multiple
            disabled={saving}
            ref={fileInputRef}
            className="hidden"
            accept={mediaType === 'image' ? 'image/png,image/jpeg,image/gif,image/webp' : 'video/mp4,video/webm'}
            onChange={handleFileChange}
          />

          <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-10 h-10 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              title="Adicionar mídia"
            >
              {mediaType === 'image' ? <Image className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button type="button" disabled={saving} onClick={() => setCameraOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" title={mediaType === 'image' ? 'Tirar foto' : 'Gravar vídeo'} aria-label={mediaType === 'image' ? 'Tirar foto pela câmera' : 'Gravar vídeo pela câmera'}>
              <Camera className="w-5 h-5" />
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
                disabled={saving || !highlightTitle.trim() || existingUrls.length + files.length === 0}
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
      {cameraOpen && <CameraCapture mode={mediaType === 'image' ? 'photo' : 'video'} maxMegabytes={20} onCapture={handleCameraCapture} onClose={() => setCameraOpen(false)} />}
    </div>
  );
}
