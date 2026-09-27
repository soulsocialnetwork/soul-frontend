import { useEffect } from 'react';
import { modalBackdropClass, modalPanelClass, modalCloseClass } from '../ui/modalStyles';
import { X } from 'lucide-react';

type Props = { username: string; onCancel: () => void; onConfirm: () => void };

export function ConfirmUnfollowModal({ username, onCancel, onConfirm }: Props) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  return <div className={modalBackdropClass.replace('z-[100]', 'z-[250]')} onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) onCancel(); }}>
    <div className={modalPanelClass} role="alertdialog" aria-modal="true" aria-labelledby="confirm-unfollow-title" aria-describedby="confirm-unfollow-description" onClick={event => event.stopPropagation()}>
      <div className="relative text-center">
        <h2 id="confirm-unfollow-title" className="text-xl font-bold text-white">Deixar de seguir?</h2>
        <button type="button" onClick={onCancel} aria-label="Fechar" className={modalCloseClass}><X className="h-5 w-5" /></button>
      </div>
      <p id="confirm-unfollow-description" className="text-center text-sm leading-relaxed text-zinc-400">Você deixará de seguir <span className="font-semibold text-white">@{username}</span>. Se o perfil for privado, precisará enviar outra solicitação para acompanhar as publicações.</p>
      <div className="flex gap-3">
        <button type="button" autoFocus onClick={onCancel} className="soul-glass h-11 flex-1 rounded-lg text-sm font-semibold text-white">Continuar seguindo</button>
        <button type="button" onClick={onConfirm} className="h-11 flex-1 rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-zinc-200">Deixar de seguir</button>
      </div>
    </div>
  </div>;
}
