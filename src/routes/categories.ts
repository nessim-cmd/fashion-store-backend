// src/routes/categories.ts
import express from 'express';
import { 
  getCategories, 
  getCategoryById, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categories';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { categoryValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// Protected admin routes
router.post('/', authenticate, authorizeAdmin, categoryValidation, createCategory);
router.put('/:id', authenticate, authorizeAdmin, categoryValidation, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;
