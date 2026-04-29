import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './products.routes';
import orderRoutes from './orders.routes';
import paymentRoutes from './payments.routes';
import qrRoutes from './qr.routes';
import configRoutes from './config.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/qr', qrRoutes);
router.use('/config', configRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
