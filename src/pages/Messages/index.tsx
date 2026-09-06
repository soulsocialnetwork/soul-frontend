import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Search, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

export default function MessagesPage() {
  const { t } = useTranslation('common');

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row overflow-hidden select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />

        <main className="flex-1 flex overflow-hidden">
          <>
            <div
              className={cn(
                'w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-background lg:bg-transparent h-full transition-all duration-300',
                'flex'
              )}
            >
              <div className="p-4 lg:p-6 pb-2">
                <h1 className="text-2xl font-bold mb-5">
                  {t('nav.messages', 'Mensagens')}
                </h1>

                <div className="relative opacity-50 cursor-not-allowed">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />

                  <input
                    type="text"
                    disabled
                    placeholder={t('messages.searchPlaceholder', 'Buscar conversa ou mensagem...')}
                    className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-textSecondary focus:outline-none focus:ring-1 focus:ring-white/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-2 pb-24 lg:pb-4 space-y-1">
                <div className="h-full flex items-center justify-center px-6 pb-16">
                  <div className="text-center max-w-[280px]">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                      <MessageSquare
                        className="w-5 h-5 text-white/35"
                        strokeWidth={1.7}
                      />
                    </div>

                    <p className="text-sm font-medium text-white/90">
                      {t('messages.emptyTitle', 'Nenhuma conversa ainda')}
                    </p>

                    <p className="text-xs mt-1.5 text-white/35 leading-relaxed">
                      {t('messages.emptyDesc', 'Suas mensagens aparecerão aqui quando você iniciar uma conversa.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={cn(
                'flex-1 flex flex-col h-full relative bg-background lg:bg-transparent',
                'hidden lg:flex items-center justify-center bg-white/[0.01]'
              )}
            >
              <div className="flex flex-col items-center justify-center text-center p-6 animate-fade-up">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                  <MessageSquare
                    className="w-6 h-6 text-white/35"
                    strokeWidth={1.7}
                  />
                </div>

                <h2 className="text-lg font-semibold text-white/90 mb-2">
                  {t('messages.rightEmptyTitle', 'Suas mensagens')}
                </h2>

                <p className="text-white/35 max-w-sm text-sm leading-relaxed">
                  {t('messages.rightEmptyDesc', 'O recurso de mensagens será integrado no futuro. Por enquanto, não há conversas ativas.')}
                </p>
              </div>
            </div>
          </>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}