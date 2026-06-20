import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// ─── Tất cả route AI yêu cầu đăng nhập ───────────────────
router.use(verifyToken);

// ─── Chatbot (FR-6.5 / RQ5) ──────────────────────────────

// POST /ai/chat-query — Gửi câu hỏi cho AI Chatbot
router.post(
  '/chat-query',
  checkPermission(PERMISSIONS.AI_CHATBOT),
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

export default router;
