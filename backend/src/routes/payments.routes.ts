import { Router } from 'express';
import {
  createPreference, handleWebhook, getPaymentStatus, confirmCashPayment
} from '../controllers/payments.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Webhook de MercadoPago (debe ser público)
router.post('/webhook', handleWebhook);

// Público: crear preferencia
router.post('/create-preference', createPreference);
router.get('/status/:payment_id', getPaymentStatus);

// Admin: confirmar pago en efectivo
router.patch('/cash/:order_id/confirm', authMiddleware, confirmCashPayment);

export default router;
