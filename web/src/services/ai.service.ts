import { apiClient } from './api';

// ─── Interfaces ───────────────────────────────────────

export interface ChatMessage {
  _id: string;
  role: 'user' | 'model';
  content: string;
  data?: any;
  conversationId?: string;
  createdAt: string;
}

export interface ChatQueryResult {
  answer: string;
  data?: any;
  conversationId: string;
}

export interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export interface QuickReplyCategory {
  [category: string]: string[];
}

// ─── Service ──────────────────────────────────────────

export const aiService = {
  /** Gửi câu hỏi cho AI Chatbot */
  chatQuery: async (
    message: string,
    conversationId?: string
  ): Promise<{ success: boolean; data: ChatQueryResult }> => {
    return apiClient.post('/ai/chat-query', { message, conversationId });
  },

  /** Lấy lịch sử chat (phân trang) */
  getChatHistory: async (
    page = 1,
    limit = 20
  ): Promise<{ success: boolean; data: { data: ChatMessage[]; total: number } }> => {
    return apiClient.get('/ai/chat-history', { params: { page, limit } });
  },

  /** Xóa toàn bộ lịch sử chat */
  clearChatHistory: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete('/ai/chat-history');
  },

  /** Lấy gợi ý câu hỏi nhanh */
  getQuickReplies: async (): Promise<{ success: boolean; data: QuickReplyCategory }> => {
    return apiClient.get('/ai/quick-replies');
  },

  /** Lấy danh sách conversations */
  getConversations: async (
    page = 1,
    limit = 20
  ): Promise<{ success: boolean; data: { conversations: Conversation[]; total: number } }> => {
    return apiClient.get('/ai/conversations', { params: { page, limit } });
  },

  /** Lấy tin nhắn trong một conversation */
  getConversationMessages: async (
    conversationId: string
  ): Promise<{ success: boolean; data: { messages: ChatMessage[] } }> => {
    return apiClient.get(`/ai/conversations/${conversationId}`);
  },

  /** Xóa một conversation */
  deleteConversation: async (
    conversationId: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/ai/conversations/${conversationId}`);
  },

  /** Đổi tên conversation */
  renameConversation: async (
    conversationId: string,
    title: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch(`/ai/conversations/${conversationId}/title`, { title });
  },
};
