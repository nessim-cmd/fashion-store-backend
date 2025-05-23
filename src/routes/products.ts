// src/routes/products.ts
import express from 'express';
import { 
  getProducts, 
  getFeaturedProducts, 
  getProductById, 
  getProductBySlug, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/products';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { productValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);

// Protected admin routes
router.post('/', authenticate, authorizeAdmin, productValidation, createProduct);
router.put('/:id', authenticate, authorizeAdmin, productValidation, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
