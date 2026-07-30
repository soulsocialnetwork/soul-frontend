import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  HelpCircle, 
  ChevronRight, 
  LogOut, 
  X, 
  Check
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';
import { ScreenLoader } from '../../components/ui/ScreenLoader';

type ModalType = 'profile' | 'security' | 'notifications' | 'language' | 'help' | 'logout' | null;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Travar o scroll quando um modal estiver aberto
  useEffect(() => {
    if (activeModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeModal]);

  // Estados de Configuração
  const [language, setLanguage] = useState(i18n?.language || 'pt-BR');
  const [name, setName] = useState('Usuário Soul');
  const [bio, setBio] = useState('Buscando presença e consciência.');
  
  // Notificações
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Alterar Idioma
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(langCode);
    }
    setActiveModal(null);
  };

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'en': return 'English (US)';
      case 'es': return 'Español';
      default: return 'Português (Brasil)';
    }
  };

  const SETTINGS_SECTIONS = [
    {
      id: 'account',
      title: 'Conta',
      items: [
        { 
          id: 'profile', 
          icon: User, 
          label: 'Perfil Pessoal', 
          desc: name, 
          action: () => setActiveModal('profile') 
        },
        { 
          id: 'security', 
          icon: Shield, 
          label: 'Privacidade e Segurança', 
          desc: 'Senhas e permissões', 
          action: () => setActiveModal('security') 
        },
      ]
    },
    {
      id: 'preferences',
      title: 'Preferências',
      items: [
        { 
          id: 'notifications', 
          icon: Bell, 
          label: 'Notificações', 
          desc: notifPush ? 'Alertas ativados' : 'Alertas pausados', 
          action: () => setActiveModal('notifications') 
        },
        { 
          id: 'language', 
          icon: Globe, 
          label: 'Idioma', 
          desc: getLanguageLabel(language), 
          action: () => setActiveModal('language') 
        },
      ]
    },
    {
      id: 'support',
      title: 'Suporte',
      items: [
        { 
          id: 'help', 
          icon: HelpCircle, 
          label: 'Central de Ajuda', 
          desc: 'FAQ e contato', 
          action: () => setActiveModal('help') 
        },
      ]
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <ScreenLoader />
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28 lg:pb-12">
              <div className="w-full max-w-2xl mx-auto px-5 lg:px-10 pt-6 lg:pt-10">
                <h1 className="text-2xl lg:text-3xl font-bold mb-8 tracking-tight animate-fade-in">
                  Configurações
                </h1>

                <div className="space-y-8">
                  {SETTINGS_SECTIONS.map((section, idx) => (
                    <div 
                      key={section.id} 
                      className="animate-fade-up" 
                      style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                    >
                      <h2 className="text-[13px] font-semibold text-textSecondary uppercase tracking-widest mb-3 ml-1">
                        {section.title}
                      </h2>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                        {section.items.map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={item.action}
                              className={cn(
                                'w-full flex items-center gap-4 p-4 sm:p-5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08] group',
                                i !== section.items.length - 1 && 'border-b border-white/[0.04]'
                              )}
                            >
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Icon className="w-5 h-5 text-textPrimary" strokeWidth={1.75} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] sm:text-[15px] font-semibold text-textPrimary">{item.label}</p>
                                <p className="text-xs text-textSecondary mt-0.5 truncate">{item.desc}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-textSecondary/40 shrink-0 group-hover:text-textPrimary/70 transition-colors" strokeWidth={2} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Botão Sair da Conta */}
                  <div className="pt-2 animate-fade-up" style={{ animationDelay: '250ms' }}>
                    <button 
                      onClick={() => setActiveModal('logout')}
                      className="w-full bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left transition-colors hover:bg-red-500/10 active:bg-red-500/20 group"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <LogOut className="w-5 h-5 text-red-400" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] sm:text-[15px] font-semibold text-red-400">Sair da conta</p>
                        <p className="text-xs text-red-400/70 mt-0.5 truncate">Encerrar sessão neste dispositivo</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-12 mb-6 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <p className="text-xs text-textSecondary/40 font-medium tracking-wide">Soul OS v1.0.0</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav />

      {/* ── MODAIS FUNCIONAIS ─── */}

      {/* Modal Idioma */}
      {activeModal === 'language' && (
        <ModalWrapper title="Selecione o Idioma" onClose={() => setActiveModal(null)}>
          <div className="space-y-2">
            {[
              { code: 'pt-BR', label: 'Português (Brasil)' },
              { code: 'en', label: 'English (US)' },
              { code: 'es', label: 'Español' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl transition-all border',
                  language === lang.code
                    ? 'bg-white/10 border-white/20 text-white font-semibold'
                    : 'bg-white/[0.02] border-transparent text-textSecondary hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="text-sm">{lang.label}</span>
                {language === lang.code && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* Modal Perfil Pessoal */}
      {activeModal === 'profile' && (
        <ModalWrapper title="Perfil Pessoal" onClose={() => setActiveModal(null)}>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textSecondary ml-1">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textSecondary ml-1">Bio / Apresentação</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-white/30 resize-none transition-colors"
              />
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all text-sm mt-2"
            >
              Salvar Alterações
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Privacidade e Segurança */}
      {activeModal === 'security' && (
        <ModalWrapper title="Privacidade e Segurança" onClose={() => setActiveModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textSecondary ml-1">Senha Atual</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textSecondary ml-1">Nova Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-textPrimary focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all text-sm mt-2"
            >
              Atualizar Senha
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Modal Notificações (Com toggles customizados) */}
      {activeModal === 'notifications' && (
        <ModalWrapper title="Preferências de Notificação" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors"
              onClick={() => setNotifPush(!notifPush)}
            >
              <div>
                <p className="text-sm font-semibold text-textPrimary">Notificações Push</p>
                <p className="text-xs text-textSecondary mt-0.5">Alertas de interações no app</p>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                notifPush ? "bg-white" : "bg-white/10"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full transition-transform duration-300",
                  notifPush ? "translate-x-7 bg-black" : "translate-x-1 bg-textSecondary"
                )} />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors"
              onClick={() => setNotifEmail(!notifEmail)}
            >
              <div>
                <p className="text-sm font-semibold text-textPrimary">Emails da Plataforma</p>
                <p className="text-xs text-textSecondary mt-0.5">Novidades e lembretes semanais</p>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                notifEmail ? "bg-white" : "bg-white/10"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full transition-transform duration-300",
                  notifEmail ? "translate-x-7 bg-black" : "translate-x-1 bg-textSecondary"
                )} />
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Central de Ajuda */}
      {activeModal === 'help' && (
        <ModalWrapper title="Central de Ajuda" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-sm font-bold text-textPrimary">O que é a plataforma Soul?</p>
              <p className="text-[13px] text-textSecondary leading-relaxed">
                O Soul é uma comunidade consciente focada em compartilhar boas energias, presença e conteúdos inspiradores.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-sm font-bold text-textPrimary">Como reportar um problema?</p>
              <p className="text-[13px] text-textSecondary leading-relaxed">
                Envie um e-mail para <span className="text-white font-medium">suporte@soul.app</span> ou contate-nos nas redes.
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

      {/* Modal Confirmação de Logout */}
      {activeModal === 'logout' && (
        <ModalWrapper title="Sair da Conta" onClose={() => setActiveModal(null)}>
          <p className="text-[13px] text-textSecondary mb-8 text-center px-4">
            Tem certeza de que deseja encerrar a sua sessão neste dispositivo?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="py-3.5 bg-white/5 border border-white/10 text-textPrimary font-bold rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
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
    </div>
  );
}

// Componente utilitário para envolver os modais
function ModalWrapper({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] bg-background border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-scale-up flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-textPrimary">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}