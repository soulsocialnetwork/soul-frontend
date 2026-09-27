import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useState } from 'react';

const soulzinho = '/soulzinho-oficial.svg';

export interface Sticker {
  id: string;
  content: string;
  label: string;
  image?: string;
  glyph?: string;
}

export const STICKER_PACKS: Array<{ title: string; stickers: Sticker[] }> = [
  { title: 'Soul', stickers: [{ id: 'soulzinho', content: ':soulzinho:', label: 'Soulzinho', image: soulzinho }] },
  { title: 'Humor', stickers: [
    { id: 'happy', content: ':sticker:happy:', label: 'Feliz', glyph: '😄' },
    { id: 'touched', content: ':sticker:touched:', label: 'Emocionado', glyph: '🥹' },
    { id: 'love', content: ':sticker:love:', label: 'Amor', glyph: '🥰' },
    { id: 'sleepy', content: ':sticker:sleepy:', label: 'Sono', glyph: '😴' },
  ] },
  { title: 'Natureza', stickers: [
    { id: 'sunflower', content: ':sticker:sunflower:', label: 'Girassol', glyph: '🌻' },
    { id: 'rainbow', content: ':sticker:rainbow:', label: 'Arco-íris', glyph: '🌈' },
    { id: 'leaf', content: ':sticker:leaf:', label: 'Folha', glyph: '🌿' },
    { id: 'sun', content: ':sticker:sun:', label: 'Sol', glyph: '☀️' },
  ] },
];

export const ALL_STICKERS = STICKER_PACKS.flatMap(pack => pack.stickers);
export function findSticker(content: string): Sticker | undefined {
  return ALL_STICKERS.find(sticker => sticker.content === content);
}

interface Props {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onEmoji: (emoji: string) => void;
  onSticker: (content: string) => void;
}

export function StickerPicker({ favorites, onToggleFavorite, onEmoji, onSticker }: Props) {
  const [tab, setTab] = useState<'emojis' | 'stickers' | 'favorites'>('emojis');
  const [pack, setPack] = useState('Soul');
  const shown = tab === 'favorites'
    ? ALL_STICKERS.filter(sticker => favorites.includes(sticker.id))
    : STICKER_PACKS.find(item => item.title === pack)?.stickers || [];
  return <div className="absolute bottom-12 left-0 z-30 w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/15 bg-[#1c1c1c] shadow-2xl">
    <div role="tablist" aria-label="Emojis e figurinhas" className="flex border-b border-white/10 p-1">
      {([['emojis', 'Emojis'], ['stickers', 'Figurinhas'], ['favorites', 'Favoritas']] as const).map(([id, label]) =>
        <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
          className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${tab === id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>{label}</button>)}
    </div>
    {tab === 'emojis' ? <Picker data={data} theme="dark" locale="pt" previewPosition="none" skinTonePosition="none" perLine={8}
      onEmojiSelect={(emoji: { native: string }) => onEmoji(emoji.native)} /> : <div className="max-h-64 overflow-y-auto p-3">
      {tab === 'stickers' && <div className="mb-3 flex flex-wrap gap-1">{STICKER_PACKS.map(item => <button key={item.title} type="button" onClick={() => setPack(item.title)} className={`rounded-lg px-2.5 py-1.5 text-xs ${pack === item.title ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>{item.title}</button>)}</div>}
      {shown.length === 0 ? <p className="py-8 text-center text-xs text-white/50">Nenhuma figurinha favorita ainda.</p> :
        <div className="grid grid-cols-4 gap-2">{shown.map(sticker => <div key={sticker.id} className="relative rounded-xl bg-white/[0.04] p-1">
          <button type="button" onClick={() => onSticker(sticker.content)} aria-label={`Enviar figurinha ${sticker.label}`} className="flex h-16 w-full items-center justify-center rounded-lg hover:bg-white/10">
            {sticker.image ? <img src={sticker.image} alt="" className="h-12 w-12 object-contain" /> : <span className="text-4xl">{sticker.glyph}</span>}
          </button>
          <button type="button" onClick={() => onToggleFavorite(sticker.id)} aria-label={favorites.includes(sticker.id) ? `Desfavoritar ${sticker.label}` : `Favoritar ${sticker.label}`}
            className="absolute right-1 top-1 rounded-md bg-black/60 px-1 text-xs text-white">{favorites.includes(sticker.id) ? '★' : '☆'}</button>
        </div>)}</div>}
    </div>}
  </div>;
}
