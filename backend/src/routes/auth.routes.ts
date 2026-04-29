import { Router } from 'express';
import { login, verifyToken, changePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/verify', authMiddleware, verifyToken);
router.put('/change-password', authMiddleware, changePassword);

export default router;
