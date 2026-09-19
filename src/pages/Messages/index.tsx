import { SecureImage } from '../../components/ui/SecureMedia';
import { getHttpErrorMessage } from '../../services/api';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Search, Send, ArrowLeft, MoreHorizontal, Plus, X, Loader2, User, CheckCheck, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { messageService, type Conversation, type Message } from '../../services/messageService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import type { ProfileSummary } from '../../services/api/types';

function MessageStatus({ readAt }: { readAt: string | null }) {
  if (!readAt) return <Check className="w-3 h-3 text-black/40" />;
  return <CheckCheck className="w-3 h-3 text-black/70" />;
}

function ConvAvatar({ conv, size = 'md' }: { conv: Conversation; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' }[size];
  return (
    <div className={cn('rounded-2xl flex items-center justify-center font-bold text-white bg-white/10 border border-white/10 overflow-hidden shrink-0', s)}>
      {conv.otherAvatar
        ? <SecureImage src={conv.otherAvatar} alt={conv.otherName} className="w-full h-full object-cover" />
        : <User className="w-5 h-5 text-white/50" />}
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversationError, setConversationError] = useState('');
  const [messageError, setMessageError] = useState('');
  const activeConversation = useRef<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [olderPage, setOlderPage] = useState(1);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvSearch, setNewConvSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileSummary[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    setConversationError('');
    try {
      const res = await messageService.getConversations();
      setConversations(res.content || []);
    } catch (error) {
      setConversationError(getHttpErrorMessage(error));
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Poll conversations list every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await messageService.getConversations();
        setConversations(res.content || []);
        setConversationError('');
      } catch (error) { setConversationError(getHttpErrorMessage(error)); }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll messages in active conversation every 3 seconds
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const res = await messageService.getMessages(selected.id);
        if (activeConversation.current !== selected.id) return;
        setMessages(prev => {
          const merged = new Map(prev.map(m => [m.id, m]));
          res.content.forEach(m => merged.set(m.id, m));
          return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        });
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  useEffect(() => {
    if (!newConvSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await userService.searchProfiles(newConvSearch.trim(), 0, 8);
        setSearchResults(res.content);
      } catch { setSearchResults([]); }
      finally { setSearchingUsers(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [newConvSearch]);

  const handleSelectConv = async (conv: Conversation) => {
    activeConversation.current = conv.id;
    setMessageError('');
    setSelected(conv);
    setShowMobileChat(true);
    setLoadingMsgs(true);
    setMessages([]);
    try {
      const res = await messageService.getMessages(conv.id);
      if (activeConversation.current !== conv.id) return;
      setMessages(res.content || []);
      setOlderPage(1);
      setHasOlder(!res.last);
    } catch (error) {
      if (activeConversation.current === conv.id) setMessageError(getHttpErrorMessage(error));
    } finally { if (activeConversation.current === conv.id) setLoadingMsgs(false); }
    // clear unread
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
  };

  const loadOlder = async () => {
    if (!selected || loadingOlder || !hasOlder) return;
    const id = selected.id;
    setLoadingOlder(true);
    try {
      const res = await messageService.getMessages(id, olderPage);
      if (activeConversation.current !== id) return;
      setMessages(previous => {
        const merged = new Map(previous.map(m => [m.id, m]));
        res.content.forEach(m => merged.set(m.id, m));
        return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
      setOlderPage(page => page + 1);
      setHasOlder(!res.last);
    } catch (error) { setMessageError(getHttpErrorMessage(error)); }
    finally { setLoadingOlder(false); }
  };

  const handleStartConv = async (username: string) => {
    try {
      const conv = await messageService.getOrCreateConversation(username);
      setShowNewConv(false);
      setNewConvSearch('');
      // Imediatamente adiciona a conversa na lista se ainda não existe
      setConversations(prev => {
        const exists = prev.some(c => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      handleSelectConv(conv);
    } catch (error) { setConversationError(getHttpErrorMessage(error)); }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selected || sending) return;
    const content = newMsg.trim();
    setNewMsg('');
    setSending(true);
    setMessageError('');
    try {
      const msg = await messageService.sendMessage(selected.id, content);
      if (activeConversation.current === selected.id) setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, lastMessage: content, lastMessageAt: msg.createdAt } : c));
    } catch (error) {
      if (activeConversation.current === selected.id) {
        setMessageError(getHttpErrorMessage(error));
        setNewMsg(current => current || content);
      }
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  useEffect(() => {
    if (loadingOlder) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filtered = conversations.filter(c =>
    c.otherName.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUsername.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row overflow-hidden select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        {messageError && <p role="alert" className="px-5 py-3 text-sm text-red-400">{messageError}</p>}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className={cn(
            'w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col border-r border-white/[0.06] h-full',
            showMobileChat ? 'hidden lg:flex' : 'flex'
          )}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Mensagens</h1>
              <button
                onClick={() => setShowNewConv(true)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-4">
              {conversationError && <div role="alert" className="px-5 py-3 text-sm text-red-400">
                <p>Não foi possível atualizar as conversas: {conversationError}</p>
                <button onClick={loadConversations} className="mt-2 underline">Tentar novamente</button>
              </div>}
              {loadingConvs ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6 gap-3">
                  <p className="text-sm text-white/30">{conversationError ? 'Conversas indisponíveis no momento' : 'Nenhuma conversa ainda'}</p>
                  <button onClick={() => setShowNewConv(true)} className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-colors">
                    Iniciar conversa
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5 px-2">
                  {filtered.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-150',
                        selected?.id === conv.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04] active:bg-white/[0.06]'
                      )}
                    >
                      <ConvAvatar conv={conv} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-white truncate">{conv.otherName}</p>
                          <span className="text-[11px] text-white/30 shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-white/40 truncate">{conv.lastMessage || 'Nenhuma mensagem'}</p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Chat */}
          <div className={cn(
            'flex-1 flex flex-col h-full relative',
            !showMobileChat && !selected ? 'hidden lg:flex' : '',
            showMobileChat ? 'flex' : 'hidden lg:flex'
          )}>
            {selected && hasOlder && <button disabled={loadingOlder} onClick={loadOlder} className="py-2 text-sm text-white/60 hover:text-white">{loadingOlder ? 'Carregando...' : 'Carregar mensagens anteriores'}</button>}
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                  <Send className="w-6 h-6 text-white/25" strokeWidth={1.7} />
                </div>
                <h2 className="text-lg font-semibold text-white/70 mb-2">Suas mensagens</h2>
                <p className="text-white/30 max-w-[280px] text-sm leading-relaxed">
                  Selecione uma conversa ou inicie uma nova.
                </p>
                <button
                  onClick={() => setShowNewConv(true)}
                  className="mt-4 px-4 py-2 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  Nova mensagem
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
                  <button
                    onClick={() => { setShowMobileChat(false); }}
                    className="lg:hidden p-1.5 -ml-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white/60" />
                  </button>
                  <div className={cn('w-9 h-9 rounded-2xl flex items-center justify-center font-bold overflow-hidden shrink-0', 'bg-white/10 border border-white/10')}>
                    {selected.otherAvatar
                      ? <SecureImage src={selected.otherAvatar} alt={selected.otherName} className="w-full h-full object-cover" />
                      : <User className="w-4 h-4 text-white/50" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none">{selected.otherName}</p>
                    <p className="text-xs text-white/35 mt-0.5">@{selected.otherUsername}</p>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-all">
                    <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2">
                  {loadingMsgs ? (
                    <div className="flex justify-center items-center h-32"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-32"><p className="text-sm text-white/20">Nenhuma mensagem ainda. Diga olá!</p></div>
                  ) : (
                    messages.map((msg, i) => {
                      const fromMe = msg.senderId === user?.id;
                      const prevSame = i > 0 && (messages[i-1].senderId === msg.senderId);
                      return (
                        <div key={msg.id} className={cn('flex gap-2', fromMe ? 'flex-row-reverse' : 'flex-row', !prevSame ? 'mt-2' : '')}>
                          {!fromMe && !prevSame && (
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 shrink-0 mt-auto overflow-hidden">
                              {selected.otherAvatar
                                ? <SecureImage src={selected.otherAvatar} className="w-full h-full object-cover" />
                                : <User className="w-3.5 h-3.5 text-white/50" />}
                            </div>
                          )}
                          {!fromMe && prevSame && <div className="w-7 shrink-0" />}
                          <div className={cn(
                            'max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                            fromMe
                              ? 'bg-white text-black rounded-tr-sm'
                              : 'bg-white/[0.06] text-white/90 rounded-tl-sm'
                          )}>
                            <p>{msg.content}</p>
                            <div className={cn('flex items-center gap-1 mt-1', fromMe ? 'justify-end' : 'justify-start')}>
                              <span className={cn('text-[10px]', fromMe ? 'text-black/40' : 'text-white/40')}>{formatTime(msg.createdAt)}</span>
                              {fromMe && <MessageStatus readAt={msg.readAt} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 px-4 py-3 pb-24 lg:pb-4 border-t border-white/[0.06]">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escreva uma mensagem..."
                        rows={1}
                        className="w-full resize-none bg-white/[0.04] border border-white/[0.07] rounded-2xl py-2.5 px-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all max-h-32 overflow-y-auto"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!newMsg.trim() || sending}
                      className={cn(
                        'p-2.5 rounded-xl transition-all shrink-0',
                        newMsg.trim() && !sending
                          ? 'bg-white hover:bg-white/90 text-black active:scale-95'
                          : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                      )}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal Nova Conversa */}
      {showNewConv && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-start justify-center pt-20 p-4" onClick={() => setShowNewConv(false)}>
          <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Nova mensagem</h3>
              <button onClick={() => setShowNewConv(false)} className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  autoFocus
                  value={newConvSearch}
                  onChange={e => setNewConvSearch(e.target.value)}
                  placeholder="Buscar usuário..."
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchingUsers ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-white/30" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleStartConv(u.username)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {u.profilePicture ? <SecureImage src={u.profilePicture} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                        <p className="text-xs text-white/40 truncate">@{u.username}</p>
                      </div>
                    </button>
                  ))
                ) : newConvSearch.trim() ? (
                  <p className="text-center text-sm text-white/30 py-4">Nenhum usuário encontrado</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
