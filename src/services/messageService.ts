import { api } from './api';
import { isLastPage } from './api/page';

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
  editedAt: string | null;
  deletedAt: string | null;
  replyToMessageId: string | null;
  replyToContent: string | null;
  kind: 'TEXT' | 'IMAGE' | 'AUDIO';
  mediaUrl: string | null;
}

export interface BlockedUser {
  id: string;
  username: string;
  name: string;
  profilePicture: string | null;
}

function mapConversation(raw: any): Conversation {
  return {
    id: raw.id,
    otherUserId: raw.otherUserId,
    otherUsername: raw.otherUsername,
    otherName: raw.otherName,
    otherAvatar: raw.otherProfilePicture ?? raw.otherAvatar ?? null,
    lastMessage: raw.lastMessage?.startsWith(':sticker:') || raw.lastMessage === ':soulzinho:' ? 'Figurinha' : raw.lastMessage ?? null,
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
    editedAt: raw.editedAt ?? null,
    deletedAt: raw.deletedAt ?? null,
    replyToMessageId: raw.replyToMessageId ?? null,
    replyToContent: raw.replyToContent ?? null,
    kind: raw.kind ?? 'TEXT',
    mediaUrl: raw.mediaUrl ?? null,
  };
}

// adapta conversas e mensagens da api para o modelo usado pela interface de dm
export const messageService = {
  async getConversations(page = 0, size = 20): Promise<{ content: Conversation[]; last: boolean }> {
    const res = await api.get('/messages/conversations', { params: { page, size } });
    const data = res.data;
    return {
      content: (data.content ?? []).map(mapConversation),
      last: isLastPage(data),
    };
  },

  async getOrCreateConversation(username: string): Promise<Conversation> {
    const res = await api.post(`/messages/conversations/${username}`);
    return mapConversation(res.data);
  },
  async getConversation(id: string): Promise<Conversation> {
    const res = await api.get(`/messages/conversations/${encodeURIComponent(id)}`);
    return mapConversation(res.data);
  },

  async getMessages(convId: string, page = 0, size = 50): Promise<{ content: Message[]; last: boolean }> {
    const res = await api.get(`/messages/conversations/${convId}/msgs`, { params: { page, size } });
    const data = res.data;
    return {
      content: (data.content ?? []).map(mapMessage),
      last: isLastPage(data),
    };
  },

  async sendMessage(convId: string, content: string, replyToMessageId?: string): Promise<Message> {
    const res = await api.post(`/messages/conversations/${convId}/msgs`, { content, replyToMessageId });
    return mapMessage(res.data);
  },
  async sendAttachment(convId: string, kind: 'IMAGE' | 'AUDIO', mediaUrl: string, caption: string, replyToMessageId?: string): Promise<Message> {
    const response = await api.post(`/messages/conversations/${encodeURIComponent(convId)}/msgs`,
      { kind, mediaUrl, content: caption, replyToMessageId });
    return mapMessage(response.data);
  },
  async editMessage(convId: string, messageId: string, content: string): Promise<Message> {
    const res = await api.patch(`/messages/conversations/${encodeURIComponent(convId)}/msgs/${encodeURIComponent(messageId)}`, { content });
    return mapMessage(res.data);
  },
  async deleteMessage(convId: string, messageId: string): Promise<void> {
    await api.delete(`/messages/conversations/${encodeURIComponent(convId)}/msgs/${encodeURIComponent(messageId)}`);
  },
  async deleteMessageForMe(convId: string, messageId: string): Promise<void> {
    await api.delete(`/messages/conversations/${encodeURIComponent(convId)}/msgs/${encodeURIComponent(messageId)}/for-me`);
  },
  async clearMessages(convId: string): Promise<void> {
    await api.delete(`/messages/conversations/${encodeURIComponent(convId)}/messages`);
  },
  async hideConversation(convId: string): Promise<void> {
    await api.delete(`/messages/conversations/${encodeURIComponent(convId)}`);
  },
  async blockConversationParticipant(convId: string): Promise<void> {
    await api.post(`/messages/conversations/${encodeURIComponent(convId)}/block`);
  },
  async getBlockedUsers(): Promise<BlockedUser[]> {
    const response = await api.get<BlockedUser[]>('/messages/blocked-users');
    return response.data;
  },
  async unblockUser(targetId: string): Promise<void> {
    await api.delete(`/messages/blocked-users/${encodeURIComponent(targetId)}`);
  },
};
