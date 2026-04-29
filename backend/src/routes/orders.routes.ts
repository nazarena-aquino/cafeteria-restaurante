import { Router } from 'express';
import {
  createOrder, getOrders, getOrderById, getOrderByNumber,
  updateOrderStatus, updatePaymentStatus, getDashboardStats
} from '../controllers/orders.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/', createOrder);
router.get('/track/:orderNumber', getOrderByNumber);

// Rutas de admin
router.get('/', authMiddleware, getOrders);
router.get('/dashboard/stats', authMiddleware, getDashboardStats);
router.get('/:id', authMiddleware, getOrderById);
router.patch('/:id/status', authMiddleware, updateOrderStatus);
router.patch('/:id/payment', authMiddleware, updatePaymentStatus);

export default router;
