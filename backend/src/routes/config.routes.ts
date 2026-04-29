import { Router } from 'express';
import { getBusinessConfig, updateBusinessConfig, toggleBusinessOpen, getMPPublicKey } from '../controllers/config.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getBusinessConfig);
router.get('/mp-public-key', getMPPublicKey);
router.put('/', authMiddleware, updateBusinessConfig);
router.patch('/toggle-open', authMiddleware, toggleBusinessOpen);

export default router;
