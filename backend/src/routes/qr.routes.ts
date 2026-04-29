import { Router } from 'express';
import { generateMenuQR, generateTableQR } from '../controllers/qr.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/menu', generateMenuQR);
router.get('/table/:tableNumber', authMiddleware, generateTableQR);

export default router;
