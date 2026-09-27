import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import {
User,
Shield,
ChevronRight,
LogOut,
X,
Trash2,
ShieldCheck,
Loader2,
Eye,
EyeOff,
ShieldBan,
Mail,
FileText,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ScreenLoader } from '../../components/ui/ScreenLoader';
import { authService } from '../../services/authService';
import { getHttpErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { messageService, type BlockedUser } from '../../services/messageService';
import { AvatarContent } from '../../components/ui/AvatarContent';

type ModalType =
| 'profile'
| 'security'
| 'email'
| 'notifications'
| 'help'
| 'logout'
| 'privacy'
| 'blockedUsers'
| 'deleteAccount'
| null;

export default function SettingsPage() {
const [loading, setLoading] = useState(true);
const [activeModal, setActiveModal] = useState<ModalType>(null);
const { user, logout, refreshUser } = useAuth();
const navigate = useNavigate();
const [saveError, setSaveError] = useState('');
const [saving, setSaving] = useState(false);
const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
const [unblockingId, setUnblockingId] = useState<string | null>(null);

useEffect(() => {
  if (activeModal !== 'blockedUsers') return;
  let cancelled = false;
  setBlockedUsersLoading(true);
  setSaveError('');
  messageService.getBlockedUsers()
    .then(users => { if (!cancelled) setBlockedUsers(users); })
    .catch(error => { if (!cancelled) setSaveError(getHttpErrorMessage(error)); })
    .finally(() => { if (!cancelled) setBlockedUsersLoading(false); });
  return () => { cancelled = true; };
}, [activeModal]);

useEffect(() => {
const timer = setTimeout(() => setLoading(false), 500);


return () => clearTimeout(timer);


}, []);

useEffect(() => {
if (activeModal) {
document.body.style.overflow = 'hidden';
} else {
document.body.style.overflow = 'unset';
}


return () => {
  document.body.style.overflow = 'unset';
};


}, [activeModal]);

const [name, setName] = useState(user?.name || 'Usuário Soul');

const [bio, setBio] = useState(
  user?.bio || ''
);

const [notifPush, setNotifPush] = useState(user?.notifPush ?? true);
const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(() => 'Notification' in window ? Notification.permission : 'unsupported');
const [notifEmail, setNotifEmail] = useState(user?.notifEmail ?? false);
const [notifQuietMode, setNotifQuietMode] = useState(user?.notifQuietMode ?? false);
const [quietModeStart, setQuietModeStart] = useState(user?.quietModeStart ?? '22:00');
const [quietModeEnd, setQuietModeEnd] = useState(user?.quietModeEnd ?? '08:00');

const [deleteConfirmText, setDeleteConfirmText] = useState('');
const [isDeletingAccount, setIsDeletingAccount] = useState(false);

const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword]         = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showNewPwd, setShowNewPwd]           = useState(false);
const [showCurrentPwd, setShowCurrentPwd]   = useState(false);
const [showConfirmPwd, setShowConfirmPwd]   = useState(false);
const [newEmail, setNewEmail] = useState('');
const [emailPassword, setEmailPassword] = useState('');
const [emailSent, setEmailSent] = useState(false);
const [showEmailPassword, setShowEmailPassword] = useState(false);
const [passwordError, setPasswordError]     = useState('');
const [passwordSuccess, setPasswordSuccess] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);

const SETTINGS_SECTIONS = [
  {
    id: 'account',
    title: 'Conta',
    items: [
      {
        id: 'profile',
        icon: User,
        label: 'Perfil Pessoal',
        desc: user?.name || 'Usuário Soul',
        action: () => setActiveModal('profile')
      },
      {
        id: 'security',
        icon: Shield,
        label: 'Alterar Senha',
        desc: 'Troque a senha da sua conta',
        action: () => setActiveModal('security')
      },
      {
        id: 'email',
        icon: Mail,
        label: 'Alterar e-mail',
        desc: user?.email || 'Confirme o novo endereço por e-mail',
        action: () => { setNewEmail(''); setEmailPassword(''); setEmailSent(false); setActiveModal('email'); }
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacidade',
    items: [
      {
        id: 'privacy',
        icon: ShieldCheck,
        label: 'Privacidade',
        desc: user?.privacyStatus ? 'Perfil privado ativo' : 'Controle quem pode ver seu perfil',
        action: () => setActiveModal('privacy')
      },
      {
        id: 'blockedUsers',
        icon: ShieldBan,
        label: 'Contas bloqueadas',
        desc: 'Veja e desbloqueie contas',
        action: () => setActiveModal('blockedUsers')
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notificações',
    items: [
      {
        id: 'notifications',
        icon: Shield,
        label: 'Notificações',
        desc: 'Push, e-mail e modo silencioso',
        action: () => setActiveModal('notifications')
      }
    ]
  },
  {
    id: 'documents',
    title: 'Documentos',
    items: [
      { id: 'guidelines', icon: FileText, label: 'Diretrizes da Comunidade', desc: 'Regras de convivência no Soul', action: () => navigate('/diretrizes') },
      { id: 'privacyPolicy', icon: FileText, label: 'Política de Privacidade', desc: 'Como os dados são usados', action: () => navigate('/privacidade') },
      { id: 'terms', icon: FileText, label: 'Termos de Uso', desc: 'Condições do ambiente de teste', action: () => navigate('/termos') },
    ]
  },
  {
    id: 'session',
    title: 'Conta e sessão',
    items: [
      {
        id: 'logout',
        icon: LogOut,
        label: 'Sair da conta',
        desc: 'Encerrar sessão neste dispositivo',
        action: () => setActiveModal('logout')
      }
    ]
  }
];

return ( <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none"> <Sidebar />


  <div className="flex-1 flex flex-col min-w-0">
    <Header />

    <main className="flex-1 flex flex-col overflow-hidden">
      {loading ? (
        <ScreenLoader />
      ) : (
        <div className="flex-1 overflow-y-auto pb-28 lg:pb-12">
          <div className="w-full max-w-2xl mx-auto px-5 lg:px-10 pt-6 lg:pt-10">
            <h1 className="text-2xl lg:text-3xl font-bold mb-8 tracking-tight animate-fade-in">
              Configurações
            </h1>

            <div className="space-y-8">
              {SETTINGS_SECTIONS.map((section, idx) => (
                <div
                  key={section.id}
                  className="animate-fade-up"
                  style={{
                    animationDelay: `${(idx + 1) * 50}ms`
                  }}
                >
                  <h2 className="text-[13px] font-semibold text-textSecondary uppercase tracking-widest mb-3 ml-1">
                    {section.title}
                  </h2>

                  <div className="flex flex-col">
                    {section.items.map((item, i) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className={cn(
                            'w-full flex items-center gap-4 py-4 text-left transition-colors hover:bg-white/[0.02] active:bg-white/[0.04] group rounded-xl px-2',
                            i !== section.items.length - 1 &&
                              'border-b border-white/[0.04]'
                          )}
                        >
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Icon
                              className="w-5 h-5 text-textPrimary"
                              strokeWidth={1.75}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] sm:text-[15px] font-semibold text-textPrimary">
                              {item.label}
                            </p>

                            <p className="text-xs text-textSecondary mt-0.5 truncate">
                              {item.desc}
                            </p>
                          </div>

                          <ChevronRight
                            className="w-5 h-5 text-textSecondary/40 shrink-0 group-hover:text-textPrimary/70 transition-colors"
                            strokeWidth={2}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div
                className="pt-2 animate-fade-up"
                style={{ animationDelay: '300ms' }}
              >
                <h2 className="mb-3 ml-1 text-[13px] font-semibold uppercase tracking-widest text-red-300/70">Zona de perigo</h2>
                <button
                  onClick={() => {
                    setDeleteConfirmText('');
                    setActiveModal('deleteAccount');
                  }}
                  className="w-full bg-transparent border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left transition-colors hover:bg-white/[0.03] active:bg-white/[0.06] group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Trash2
                      className="w-5 h-5 text-zinc-500"
                      strokeWidth={1.75}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] sm:text-[15px] font-semibold text-zinc-400">
                      Excluir conta
                    </p>

                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      Remover permanentemente todos os seus dados
                    </p>
                  </div>
                </button>
              </div>
            </div>


          </div>
        </div>
      )}
    </main>
  </div>

  <BottomNav />

  {activeModal === 'profile' && (
    <ModalWrapper
      title="Perfil Pessoal"
      onClose={() => setActiveModal(null)}
    >
      <div className="space-y-5">
        {saveError && <p role="alert" className="text-red-400 text-sm">{saveError}</p>}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-textSecondary ml-1">
            Nome completo
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-textSecondary ml-1">
            Bio / Apresentação
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-white/30 resize-none transition-colors"
          />
        </div>

        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true); setSaveError('');
            try {
              await authService.updateProfile({ name, bio, profilePicture: user?.profilePicture ?? null });
              await refreshUser(); setActiveModal(null);
            } catch (error) { setSaveError(getHttpErrorMessage(error)); }
            finally { setSaving(false); }
          }}
          className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all text-sm mt-2"
        >
          Salvar Alterações
        </button>
      </div>
    </ModalWrapper>
  )}

  {activeModal === 'security' && (
    <ModalWrapper
      title="Privacidade e Segurança"
      onClose={() => { setActiveModal(null); setPasswordError(''); setPasswordSuccess(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPasswordError('');
          setPasswordSuccess(false);
          if (!currentPassword) { setPasswordError('Informe a senha atual.'); return; }
          if (newPassword.length < 8) { setPasswordError('A nova senha precisa ter no mínimo 8 caracteres.'); return; }
          if (!/[A-Z]/.test(newPassword)) { setPasswordError('Use ao menos uma letra maiúscula.'); return; }
          if (!/[0-9]/.test(newPassword)) { setPasswordError('Use ao menos um número.'); return; }
          if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem.'); return; }
          setIsChangingPassword(true);
          try {
            await authService.changePassword(currentPassword, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
          } catch (error) {
            setPasswordError(getHttpErrorMessage(error));
          } finally {
            setIsChangingPassword(false);
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-textSecondary ml-1">Senha Atual</label>
          <div className="relative">
          <input
            type={showCurrentPwd ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
            placeholder="••••••••"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pr-11 text-sm text-textPrimary focus:outline-none focus:border-white/30 transition-colors"
          />
          <button type="button" aria-label={showCurrentPwd ? 'Ocultar senha atual' : 'Mostrar senha atual'} onClick={() => setShowCurrentPwd(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50">
            {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-textSecondary ml-1">Nova Senha</label>
          <div className="relative">
            <input
              type={showNewPwd ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
              placeholder="••••••••"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pr-11 text-sm text-textPrimary focus:outline-none focus:border-white/30 transition-colors"
            />
            <button type="button" onClick={() => setShowNewPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <p className={cn('text-xs ml-1', newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'text-emerald-400' : 'text-amber-400')}>
              {newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? '✓ Senha forte' : 'Mín. 8 chars, 1 maiúscula, 1 número'}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-textSecondary ml-1">Confirmar Nova Senha</label>
          <div className="relative">
          <input
            type={showConfirmPwd ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
            placeholder="••••••••"
            className={cn('w-full bg-black/20 border rounded-xl px-4 py-3.5 pr-11 text-sm text-textPrimary focus:outline-none transition-colors', confirmPassword.length > 0 && confirmPassword !== newPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/30')}
          />
          <button type="button" aria-label={showConfirmPwd ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'} onClick={() => setShowConfirmPwd(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50">
            {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          </div>
          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <p className="text-xs text-red-400 ml-1">As senhas não coincidem.</p>
          )}
        </div>

        {passwordError && <p className="text-xs text-red-400 ml-1">{passwordError}</p>}
        {passwordSuccess && <p className="text-xs text-emerald-400 ml-1">✓ Senha alterada com sucesso!</p>}

        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all text-sm mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isChangingPassword ? <><Loader2 className="w-4 h-4 animate-spin" />Alterando...</> : 'Atualizar Senha'}
        </button>
      </form>
    </ModalWrapper>
  )}

  {activeModal === 'email' && (
    <ModalWrapper title="Alterar e-mail" onClose={() => setActiveModal(null)}>
      {emailSent ? <div className="space-y-4 text-sm text-textSecondary"><p>Enviamos um link de confirmação para <strong className="text-white">{newEmail}</strong>. O endereço atual continua em uso até você confirmar pelo link.</p><button type="button" onClick={() => setActiveModal(null)} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black">Entendi</button></div> :
        <form onSubmit={async event => {
          event.preventDefault(); setSaveError(''); setSaving(true);
          try { await authService.requestEmailChange(newEmail.trim(), emailPassword); setEmailSent(true); setEmailPassword(''); }
          catch (error) { setSaveError(getHttpErrorMessage(error)); }
          finally { setSaving(false); }
        }} className="space-y-4">
          <p className="text-sm text-textSecondary">E-mail atual: <span className="text-white">{user?.email}</span></p>
          <label className="block text-xs text-textSecondary">Novo e-mail<input type="email" required value={newEmail} onChange={event => setNewEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40" /></label>
          <label className="block text-xs text-textSecondary">Senha atual<div className="relative mt-1.5"><input type={showEmailPassword ? 'text' : 'password'} required value={emailPassword} onChange={event => setEmailPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-sm text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40" /><button type="button" onClick={() => setShowEmailPassword(value => !value)} aria-label={showEmailPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">{showEmailPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-50">{saving ? 'Enviando...' : 'Enviar confirmação'}</button>
        </form>}
    </ModalWrapper>
  )}

  {activeModal === 'notifications' && (
    <ModalWrapper
      title="Preferências de Notificação"
      onClose={() => setActiveModal(null)}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">
            Modo Silencioso
          </h4>

          <p className="text-xs text-textSecondary/80 ml-1 mb-2">
                Silencia alertas do navegador durante o horário escolhido.
          </p>

          <div
            className="flex items-center justify-between p-4 rounded-xl soul-glass cursor-pointer transition-colors"
            role="switch"
            tabIndex={0}
            aria-checked={notifQuietMode}
            onClick={() => setNotifQuietMode(!notifQuietMode)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setNotifQuietMode(value => !value); } }}
          >
            <div>
              <p className="text-sm font-semibold text-textPrimary">
                Ativar Modo Silencioso
              </p>
            </div>

            <div
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                notifQuietMode ? 'bg-white' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full transition-transform duration-300',
                  notifQuietMode
                    ? 'translate-x-7 bg-black'
                    : 'translate-x-1 bg-textSecondary'
                )}
              />
            </div>
          </div>

          {notifQuietMode && (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-medium text-textSecondary ml-1">
                  Início
                </label>

                <input
                  type="time"
                  value={quietModeStart}
                  onChange={(e) => setQuietModeStart(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-medium text-textSecondary ml-1">
                  Fim
                </label>

                <input
                  type="time"
                  value={quietModeEnd}
                  onChange={(e) => setQuietModeEnd(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1 mb-2">
            Geral
          </h4>

          <div
            className="flex items-center justify-between p-4 rounded-xl soul-glass cursor-pointer transition-colors"
            role="switch"
            tabIndex={0}
            aria-checked={notifPush}
            onClick={() => setNotifPush(!notifPush)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setNotifPush(value => !value); } }}
          >
            <div>
              <p className="text-sm font-semibold text-textPrimary">
                Notificações Push
              </p>

              <p className="text-xs text-textSecondary mt-0.5">
                Alertas do navegador enquanto o Soul estiver aberto
              </p>
            </div>

            <div
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                notifPush ? 'bg-white' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full transition-transform duration-300',
                  notifPush
                    ? 'translate-x-7 bg-black'
                    : 'translate-x-1 bg-textSecondary'
                )}
              />
            </div>
          </div>

          {notifPush && <div className="px-1 text-xs text-textSecondary">
            {browserPermission !== 'unsupported' ? browserPermission === 'granted'
              ? 'Notificações do navegador permitidas.'
              : browserPermission === 'denied'
                ? 'Notificações bloqueadas no navegador. Libere o Soul nas permissões do site.'
                : <button type="button" onClick={() => void Notification.requestPermission().then(permission => { setBrowserPermission(permission); window.dispatchEvent(new Event('soul:browser-permission-updated')); })} className="text-white/80 underline hover:text-white">Permitir notificações do navegador</button>
              : 'Este navegador não oferece notificações do sistema.'}
          </div>}

          <div
            className="flex items-center justify-between p-4 rounded-xl soul-glass cursor-pointer transition-colors"
            role="switch"
            tabIndex={0}
            aria-checked={notifEmail}
            onClick={() => setNotifEmail(!notifEmail)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setNotifEmail(value => !value); } }}
          >
            <div>
              <p className="text-sm font-semibold text-textPrimary">
                Emails da Plataforma
              </p>

              <p className="text-xs text-textSecondary mt-0.5">
                Novidades e lembretes semanais
              </p>
            </div>

            <div
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                notifEmail ? 'bg-white' : 'bg-white/10'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full transition-transform duration-300',
                  notifEmail
                    ? 'translate-x-7 bg-black'
                    : 'translate-x-1 bg-textSecondary'
                )}
              />
            </div>
          </div>
        </div>
        {saveError && <p role="alert" className="text-red-400 text-sm">{saveError}</p>}
        <button disabled={saving} className="w-full py-3 bg-white text-black rounded-xl disabled:opacity-50" onClick={async () => {
          setSaving(true); setSaveError('');
          try {
            await authService.updateNotifications({ notifPush, notifEmail, notifQuietMode, quietModeStart, quietModeEnd });
            await refreshUser(); setActiveModal(null);
          } catch (error) { setSaveError(getHttpErrorMessage(error)); }
          finally { setSaving(false); }
        }}>Salvar preferências</button>
      </div>
    </ModalWrapper>
  )}

  {activeModal === 'help'  && (
    <ModalWrapper
      title="Central de Ajuda"
      onClose={() => setActiveModal(null)}
    >
      <div className="space-y-3">
        <div className="p-5 rounded-xl soul-glass space-y-2">
          <p className="text-sm font-bold text-textPrimary">
            O que é a plataforma Soul?
          </p>

          <p className="text-[13px] text-textSecondary leading-relaxed">
            O Soul é uma comunidade consciente focada em compartilhar boas
            energias, presença e conteúdos inspiradores.
          </p>
        </div>

        <div className="p-5 rounded-xl soul-glass space-y-2">
          <p className="text-sm font-bold text-textPrimary">
            Como reportar um problema?
          </p>

          <p className="text-[13px] text-textSecondary leading-relaxed">
            Envie um e-mail para{' '}
            <span className="text-white font-medium">
              suporte@soul.app
            </span>{' '}
            ou contate-nos nas redes.
          </p>
        </div>

        <button
          onClick={() => setActiveModal(null)}
          className="w-full py-3.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 active:scale-[0.98] transition-all text-sm mt-4"
        >
          Entendido
        </button>
      </div>
    </ModalWrapper>
  )}

  {activeModal === 'logout' && (
    <ModalWrapper
      title="Sair da Conta"
      onClose={() => setActiveModal(null)}
    >
      <p className="text-[13px] text-textSecondary mb-8 text-center px-4">
        Tem certeza de que deseja encerrar a sua sessão neste dispositivo?
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveModal(null)}
          className="py-3.5 soul-glass text-textPrimary font-bold rounded-xl active:scale-[0.98] transition-all text-sm"
        >
          Cancelar
        </button>

        <button
          onClick={async () => {
            await logout();
            setActiveModal(null);
            navigate('/auth');
          }}
          className="py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all text-sm"
        >
          Sair
        </button>
      </div>
    </ModalWrapper>
  )}

  {activeModal === 'privacy' && (
    <ModalWrapper
      title="Privacidade"
      onClose={() => setActiveModal(null)}
    >
      <div className="space-y-5">
        {saveError && <p role="alert" className="text-red-400 text-sm">{saveError}</p>}
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(user?.privacyStatus)}
          disabled={saving}
          onClick={async () => {
            if (!user || saving) return;
            setSaving(true);
            setSaveError('');
            try {
              await authService.updatePrivacy(!user.privacyStatus);
              await refreshUser();
            } catch (error) {
              setSaveError(getHttpErrorMessage(error));
            } finally {
              setSaving(false);
            }
          }}
          className="w-full flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.07] disabled:opacity-50"
        >
          <span>
            <span className="block text-sm font-semibold text-white">Perfil privado</span>
            <span className="mt-1 block text-xs leading-relaxed text-textSecondary">Quem quiser seguir você enviará uma solicitação. Só seguidores aprovados poderão ver seus posts e Soults.</span>
          </span>
          <span aria-hidden="true" className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', user?.privacyStatus ? 'bg-white' : 'bg-white/20')}>
            <span className={cn('absolute top-1 h-4 w-4 rounded-full transition-transform', user?.privacyStatus ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white')} />
          </span>
        </button>
        <p className="text-xs leading-relaxed text-textSecondary">As solicitações pendentes aparecem na aba Solicitações das notificações.</p>
      </div>
    </ModalWrapper>
  )}

  {activeModal === 'blockedUsers' && (
    <ModalWrapper title="Contas bloqueadas" onClose={() => setActiveModal(null)}>
      {saveError && <p role="alert" className="mb-3 text-sm text-red-400">{saveError}</p>}
      {blockedUsersLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : blockedUsers.length === 0 ? (
        <p className="py-6 text-center text-sm text-textSecondary">Você não bloqueou nenhuma conta.</p>
      ) : (
        <div className="space-y-2">
          {blockedUsers.map(blocked => (
            <div key={blocked.id} className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl text-sm"><AvatarContent src={blocked.profilePicture} name={blocked.name || blocked.username} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{blocked.name}</p>
                <p className="truncate text-xs text-textSecondary">@{blocked.username}</p>
              </div>
              <button
                type="button"
                disabled={unblockingId === blocked.id}
                onClick={async () => {
                  setUnblockingId(blocked.id);
                  setSaveError('');
                  try {
                    await messageService.unblockUser(blocked.id);
                    setBlockedUsers(users => users.filter(item => item.id !== blocked.id));
                  } catch (error) { setSaveError(getHttpErrorMessage(error)); }
                  finally { setUnblockingId(null); }
                }}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-50"
              >Desbloquear</button>
            </div>
          ))}
        </div>
      )}
    </ModalWrapper>
  )}

  {activeModal === 'deleteAccount' && (
    <ModalWrapper
      title="Excluir Conta"
      onClose={() => setActiveModal(null)}
    >
      <div className="space-y-5">
        {saveError && <p role="alert" className="text-red-400 text-sm">{saveError}</p>}
        <div className="p-4 rounded-xl soul-glass space-y-2">
          <p className="text-[13px] text-textSecondary leading-relaxed">
            Seus dados serão permanentemente removidos dos nossos
            servidores. Esta ação{' '}
            <strong className="text-white">
              não pode ser desfeita
            </strong>
            .
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-textSecondary ml-1">
            Digite{' '}
            <span className="text-white font-bold">EXCLUIR</span> para
            confirmar
          </label>

          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="EXCLUIR"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-white/30 transition-colors uppercase tracking-widest"
          />
        </div>

        <button
          disabled={deleteConfirmText !== 'EXCLUIR' || isDeletingAccount}
          onClick={async () => {
            setIsDeletingAccount(true);
            try {
              await authService.deleteAccount();
              await logout();
              navigate('/auth');
            } catch (error) {
              setSaveError(getHttpErrorMessage(error));
              setIsDeletingAccount(false);
            }
          }}
          className="w-full py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDeletingAccount ? <><Loader2 className="w-4 h-4 animate-spin" />Excluindo...</> : 'Excluir permanentemente'}
        </button>
      </div>
    </ModalWrapper>
  )}
</div>


);
}

function ModalWrapper({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative text-center space-y-3">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          
          <button
            onClick={onClose}
            className="absolute -top-1 -right-2 p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-left w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
