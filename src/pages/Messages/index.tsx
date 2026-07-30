import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Search, Send, Image as ImageIcon, ArrowLeft, CheckCheck, MessageSquare, Trash2, MoreVertical, User, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';
import { ScreenLoader } from '../../components/ui/ScreenLoader';

export interface Chat {
  id: number;
  username: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: string | number;
  chatId: number;
  senderId: number | 'me';
  text: string;
  time: string;
  isMine: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const INITIAL_CHATS: Chat[] = [
  { id: 1, username: 'lucas.rodrigues', name: 'Lucas Rodrigues', avatar: 'https://i.pravatar.cc/150?u=lucas', lastMsg: 'Na correria. Bora treinar amanhã?', time: '10:42', unread: 2, online: true },
  { id: 2, username: 'maria', name: 'Maria Silva', avatar: 'https://i.pravatar.cc/150?u=maria', lastMsg: 'Que texto incrível no seu post!', time: 'Ontem', unread: 0, online: false },
  { id: 3, username: 'elizabeth.p', name: 'Elizabeth Pelegrini', avatar: 'https://i.pravatar.cc/150?u=elizabeth', lastMsg: 'Obrigada pela indicação de livro.', time: 'Segunda', unread: 0, online: true },
  { id: 4, username: 'joao.carlos', name: 'João Carlos', avatar: 'https://i.pravatar.cc/150?u=joao', lastMsg: 'Você viu a última feature do Soul?', time: '14 de abr.', unread: 0, online: false },
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: '1-1', chatId: 1, senderId: 1, text: 'Fala Eduardo, tudo bem?', time: '10:30', isMine: false },
    { id: '1-2', chatId: 1, senderId: 'me', text: 'Tudo ótimo, Lucas! E contigo?', time: '10:32', isMine: true, status: 'read' },
    { id: '1-3', chatId: 1, senderId: 1, text: 'Na correria. Bora treinar amanhã?', time: '10:42', isMine: false },
  ],
  2: [
    { id: '2-1', chatId: 2, senderId: 2, text: 'Oi Eduardo! Vi seu último post sobre presença e atenção plena.', time: 'Ontem 18:20', isMine: false },
    { id: '2-2', chatId: 2, senderId: 2, text: 'Que texto incrível no seu post!', time: 'Ontem 18:21', isMine: false },
  ],
  3: [
    { id: '3-1', chatId: 3, senderId: 'me', text: 'Oi Elizabeth! Conseguiu começar aquele livro que conversamos?', time: 'Segunda 14:10', isMine: true, status: 'read' },
    { id: '3-2', chatId: 3, senderId: 3, text: 'Obrigada pela indicação de livro.', time: 'Segunda 15:05', isMine: false },
  ],
  4: [
    { id: '4-1', chatId: 4, senderId: 4, text: 'Você viu a última feature do Soul?', time: '14 de abr.', isMine: false },
  ],
};

export default function MessagesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [msgInput, setMsgInput] = useState('');
  
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [showOptionsHeader, setShowOptionsHeader] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation('common');

  const selectedChat = chats.find(c => c.id === activeChatId);
  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeChatId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptionsHeader(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    setShowOptionsHeader(false);
    setChats(prevChats =>
      prevChats.map(c => (c.id === chatId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!msgInput.trim() || activeChatId === null) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: Message = {
      id: Date.now().toString(),
      chatId: activeChatId,
      senderId: 'me',
      text: msgInput.trim(),
      time: timeStr,
      isMine: true,
      status: 'sent',
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, lastMsg: newMsg.text, time: timeStr }
          : c
      )
    );

    const sentText = msgInput.trim();
    setMsgInput('');

    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        chatId: activeChatId,
        senderId: activeChatId,
        text: `Recebido! Em breve te respondo sobre "${sentText.slice(0, 15)}..."`,
        time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        isMine: false,
      };

      setMessages(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), autoReply],
      }));

      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, lastMsg: autoReply.text, time: autoReply.time }
            : c
        )
      );
    }, 1500);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete === null) return;

    setChats(prev => prev.filter(c => c.id !== chatToDelete));
    
    setMessages(prev => {
      const copy = { ...prev };
      delete copy[chatToDelete];
      return copy;
    });

    if (activeChatId === chatToDelete) {
      setActiveChatId(null);
    }

    setChatToDelete(null);
    setShowOptionsHeader(false);
  };

  const handleBlockUser = () => {
    setShowOptionsHeader(false);
    if (selectedChat) {
      alert(`${selectedChat.name} foi bloqueado(a).`);
    }
  };

  const handleViewProfile = () => {
    setShowOptionsHeader(false);
    if (selectedChat) {
      navigate(`/profile/${selectedChat.username}`);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row overflow-hidden select-none">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {!activeChatId && <Header />}
        
        <main className="flex-1 flex overflow-hidden">
          
          {loading ? (
            <ScreenLoader />
          ) : (
            <>
              {/* painel esquerdo com a lista de conversas */}
              <div className={cn(
                "w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-background lg:bg-transparent h-full transition-all duration-300",
                activeChatId ? "hidden lg:flex" : "flex"
              )}>
                <div className="p-4 lg:p-6 pb-2">
                  <h1 className="text-2xl font-bold mb-5">{t('nav.messages', 'Mensagens')}</h1>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar conversa ou mensagem..." 
                      className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-textSecondary focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-2 pb-24 lg:pb-4 space-y-1">
                  {filteredChats.length === 0 ? (
                    <p className="text-center text-textSecondary text-xs py-8">Nenhuma conversa encontrada</p>
                  ) : (
                    filteredChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        // CORREÇÃO AQUI: Trocado 'glass-card' por 'bg-white/10' para zerar a borda branca do item ativo
                        className={cn(
                          "w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl transition-all duration-200 text-left border-0 outline-none focus:outline-none focus:ring-0 select-none",
                          activeChatId === chat.id ? "bg-white/10 shadow-md" : "hover:bg-white/5"
                        )}
                      >
                        <div className="relative shrink-0">
                          <img src={chat.avatar} alt={chat.name} className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl object-cover" />
                          {chat.online && (
                            <div className="absolute bottom-0 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[2.5px] border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-semibold text-textPrimary truncate text-[15px]">{chat.name}</span>
                            <span className={cn("text-xs shrink-0 ml-2", chat.unread > 0 ? "text-white font-semibold" : "text-textSecondary")}>
                              {chat.time}
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <p className={cn("text-sm truncate", chat.unread > 0 ? "text-white font-medium" : "text-textSecondary")}>
                              {chat.lastMsg}
                            </p>
                            {chat.unread > 0 && (
                              <div className="shrink-0 w-5 h-5 rounded-full bg-white text-background flex items-center justify-center text-[11px] font-bold">
                                {chat.unread}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* painel direito com o chat ativo */}
              <div className={cn(
                "flex-1 flex flex-col h-full relative bg-background lg:bg-transparent",
                !activeChatId ? "hidden lg:flex items-center justify-center bg-white/[0.01]" : "flex"
              )}>
                {!activeChatId ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 animate-fade-up">
                    <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-6 shadow-xl">
                      <MessageSquare className="w-8 h-8 text-textSecondary" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Suas mensagens</h2>
                    <p className="text-textSecondary max-w-sm text-sm">
                      Inicie uma conversa ou selecione um chat para se conectar de forma profunda e sem distrações.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* cabeçalho do chat ativo */}
                    <div className="glass-header px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm z-10 relative">
                      <button 
                        onClick={() => setActiveChatId(null)}
                        className="lg:hidden p-2 -ml-2 text-textSecondary hover:text-white transition-colors focus:outline-none"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </button>

                      <div 
                        onClick={handleViewProfile}
                        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer group"
                      >
                        <div className="relative shrink-0">
                          <img src={selectedChat?.avatar} alt={selectedChat?.name} className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl object-cover group-hover:opacity-80 transition-opacity" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h2 className="font-semibold text-sm lg:text-base truncate group-hover:underline">{selectedChat?.name}</h2>
                          {selectedChat?.online ? (
                            <p className="text-xs text-emerald-400 font-medium">Online</p>
                          ) : (
                            <p className="text-xs text-textSecondary">Visto por último: {selectedChat?.time}</p>
                          )}
                        </div>
                      </div>

                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setShowOptionsHeader(!showOptionsHeader)}
                          className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {showOptionsHeader && (
                          <div className="absolute right-0 top-12 w-48 glass-card border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-scale-up space-y-0.5">
                            <button
                              onClick={handleViewProfile}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-textPrimary hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
                            >
                              <User className="w-4 h-4 text-textSecondary" />
                              <span>Ver perfil</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowOptionsHeader(false);
                                setChatToDelete(activeChatId);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Apagar conversa</span>
                            </button>

                            <button
                              onClick={handleBlockUser}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              <span>Bloquear</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* lista de mensagens da conversa */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 flex flex-col gap-4 select-none">
                      {currentMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-textSecondary text-xs">
                          Nenhuma mensagem por aqui. Diga olá!
                        </div>
                      ) : (
                        currentMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={cn(
                              "flex max-w-[85%] lg:max-w-[70%] select-none",
                              msg.isMine ? "self-end" : "self-start"
                            )}
                          >
                            <div className={cn(
                              "rounded-2xl px-4 py-2.5 shadow-md text-[15px] leading-relaxed relative select-none",
                              msg.isMine 
                                ? "bg-white text-background rounded-tr-sm font-normal" 
                                : "glass-card rounded-tl-sm text-textPrimary"
                            )}>
                              <p className="break-words select-none">{msg.text}</p>
                              <div className={cn(
                                "flex items-center gap-1.5 mt-1 text-[10px] font-semibold uppercase justify-end select-none",
                                msg.isMine ? "text-background/60" : "text-textSecondary"
                              )}>
                                <span>{msg.time}</span>
                                {msg.isMine && (
                                  <CheckCheck className={cn("w-3.5 h-3.5", msg.status === 'read' ? "text-[#0055FF]" : "text-background/40")} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* input para digitar nova mensagem */}
                    <form 
                      onSubmit={handleSendMessage}
                      className="p-4 bg-background lg:glass-header lg:bg-transparent border-t border-white/[0.06] shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-4 z-10"
                    >
                      <div className="flex items-center gap-2 lg:gap-3 max-w-4xl mx-auto">
                        <button 
                          type="button"
                          className="p-2.5 lg:p-3 text-textSecondary hover:text-white transition-colors glass-pill rounded-2xl shrink-0 focus:outline-none"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            placeholder="Escreva sua mensagem..."
                            className="w-full glass-input rounded-2xl py-3 px-4 text-[15px] text-white placeholder-textSecondary focus:outline-none focus:ring-1 focus:ring-white/20 select-text"
                          />
                        </div>
                        
                        <button 
                          type="submit"
                          disabled={!msgInput.trim()}
                          className={cn(
                            "p-2.5 lg:p-3 rounded-2xl shrink-0 transition-all shadow-md focus:outline-none",
                            msgInput.trim().length > 0 
                              ? "bg-white text-black hover:bg-white/90 active:scale-95" 
                              : "glass-pill text-textSecondary cursor-not-allowed opacity-40"
                          )}
                        >
                          <Send className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* modal de confirmação para apagar conversa */}
      {chatToDelete !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setChatToDelete(null)}
        >
          <div 
            className="w-full max-w-sm glass-card border border-white/10 rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl glass-pill border border-white/10 text-textSecondary flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Apagar conversa?</h3>
              <p className="text-xs text-textSecondary leading-relaxed px-2">
                As mensagens selecionadas serão removidas permanentemente desta sessão.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setChatToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white hover:bg-white/5 transition-colors focus:outline-none"
              >
                {t('cancel', 'Cancelar')}
              </button>
              <button
                onClick={confirmDeleteChat}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-md focus:outline-none"
              >
                {t('confirm', 'Confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {!activeChatId && <BottomNav />}
    </div>
  );
}