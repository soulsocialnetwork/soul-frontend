import { api } from './api';

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUsername: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

// Backend returns otherProfilePicture; we normalize to otherAvatar
function mapConversation(raw: any): Conversation {
  return {
    id: raw.id,
    otherUserId: raw.otherUserId,
    otherUsername: raw.otherUsername,
    otherName: raw.otherName,
    otherAvatar: raw.otherProfilePicture ?? raw.otherAvatar ?? null,
    lastMessage: raw.lastMessage ?? null,
    lastMessageAt: raw.lastMessageAt ?? null,
    unreadCount: raw.unreadCount ?? 0,
  };
}

function mapMessage(raw: any): Message {
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    senderId: raw.senderId,
    content: raw.content,
    createdAt: raw.createdAt,
    readAt: raw.readAt ?? null,
  };
}

export const messageService = {
  async getConversations(page = 0, size = 20): Promise<{ content: Conversation[]; last: boolean }> {
    const res = await api.get('/messages/conversations', { params: { page, size } });
    const data = res.data;
    return {
      content: (data.content ?? []).map(mapConversation),
      last: data.last ?? true,
    };
  },

  async getOrCreateConversation(username: string): Promise<Conversation> {
    const res = await api.post(`/messages/conversations/${username}`);
    return mapConversation(res.data);
  },

  async getMessages(convId: string, page = 0, size = 50): Promise<{ content: Message[]; last: boolean }> {
    const res = await api.get(`/messages/conversations/${convId}/msgs`, { params: { page, size } });
    const data = res.data;
    return {
      content: (data.content ?? []).map(mapMessage),
      last: data.last ?? true,
    };
  },

  async sendMessage(convId: string, content: string): Promise<Message> {
    const res = await api.post(`/messages/conversations/${convId}/msgs`, { content });
    return mapMessage(res.data);
  },
};
