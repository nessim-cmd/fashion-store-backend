// src/routes/categories.ts
import express from 'express';
import { 
  getCategories, 
  getCategoryById, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/categories';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { categoryValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);

// Subcategory routes (before /:id to avoid conflicts)
router.get('/subcategories', getSubcategories);
router.post('/subcategories', authenticate, authorizeAdmin, createSubcategory);
router.put('/subcategories/:id', authenticate, authorizeAdmin, updateSubcategory);
router.delete('/subcategories/:id', authenticate, authorizeAdmin, deleteSubcategory);

// Category by ID (after subcategories to avoid route conflict)
router.get('/:id', getCategoryById);

// Protected admin routes
router.post('/', authenticate, authorizeAdmin, categoryValidation, createCategory);
router.put('/:id', authenticate, authorizeAdmin, categoryValidation, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;
