import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Khách hàng tạo intent thanh toán online
router.post('/create-intent', verifyToken, PaymentController.createIntent);

// Webhook từ cổng thanh toán (không authenticate bằng JWT mà dùng signature, tạm thời để public)
router.post('/webhook', PaymentController.webhook);

// Staff thu tiền mặt tại cổng & checkout
router.post('/cash-checkout', verifyToken, PaymentController.cashCheckout);

// Polling kiểm tra trạng thái thanh toán Momo
router.get('/status/:transactionCode', verifyToken, PaymentController.checkStatus);

// Xem lịch sử thanh toán của 1 session
router.get('/:sessionId', verifyToken, PaymentController.getPaymentsBySession);

export default router;
