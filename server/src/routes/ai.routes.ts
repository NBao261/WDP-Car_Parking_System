import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis, isRedisConnected } from '../config/redis';

const router = Router();

// Strict AI Rate Limiter (5 requests per minute)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Bạn đã vượt quá giới hạn gọi AI Chatbot (5 lần/phút). Vui lòng đợi trong giây lát.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const client = getRedis();
      if (!client) throw new Error('Redis not connected');
      // @ts-ignore
      return (client.call as any)(...args);
    },
  }),
});

// ─── Tất cả route AI yêu cầu đăng nhập ───────────────────
router.use(verifyToken);

// ─── Chatbot (FR-6.5 / RQ5) ──────────────────────────────

// POST /ai/chat-query — Gửi câu hỏi cho AI Chatbot
router.post(
  '/chat-query',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  aiRateLimiter,
  AIController.chatQuery
);

// GET /ai/chat-history — Lịch sử chat (phân trang)
router.get(
  '/chat-history',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.getChatHistory
);

// DELETE /ai/chat-history — Xóa lịch sử chat
router.delete(
  '/chat-history',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.clearChatHistory
);

// GET /ai/quick-replies — Gợi ý câu hỏi nhanh
router.get(
  '/quick-replies',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.getQuickReplies
);

// GET /ai/conversations — Lấy danh sách conversation của user
router.get(
  '/conversations',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.getConversations
);

// GET /ai/conversations/:conversationId — Lấy tin nhắn trong conversation
router.get(
  '/conversations/:conversationId',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.getConversationMessages
);

// DELETE /ai/conversations/:conversationId — Xóa conversation
router.delete(
  '/conversations/:conversationId',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.deleteConversation
);

// PATCH /ai/conversations/:conversationId/title — Đổi tên conversation
router.patch(
  '/conversations/:conversationId/title',
  checkPermission(PERMISSIONS.AI_CHATBOT),
  AIController.renameConversation
);

export default router;
