import { Router } from 'express';
import {
  getProducts, getAllProducts, getProductById,
  createProduct, updateProduct, deleteProduct, toggleProductAvailability,
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory
} from '../controllers/products.controller';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import { uploadProductImage } from '../controllers/products.controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/featured', (req, res) => {
  req.query.featured = 'true';
  return getProducts(req, res);
});
router.get('/categories/public', getCategories);
router.get('/:id', getProductById);
router.post('/admin/upload-image', authMiddleware, upload.single('image'), uploadProductImage);

// Rutas de admin
router.get('/admin/all', authMiddleware, getAllProducts);
router.get('/admin/categories', authMiddleware, getAllCategories);
router.post('/admin/categories', authMiddleware, createCategory);
router.put('/admin/categories/:id', authMiddleware, updateCategory);
router.delete('/admin/categories/:id', authMiddleware, deleteCategory);
router.post('/admin', authMiddleware, createProduct);
router.put('/admin/:id', authMiddleware, updateProduct);
router.delete('/admin/:id', authMiddleware, deleteProduct);
router.patch('/admin/:id/toggle', authMiddleware, toggleProductAvailability);

export default router;
