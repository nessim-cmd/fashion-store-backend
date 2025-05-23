// src/routes/attributes.ts
import express from 'express';
import { 
  getAttributes, 
  createAttribute, 
  updateAttribute, 
  deleteAttribute 
} from '../controllers/attributes';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { attributeValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getAttributes);

// Admin routes
router.post('/', authenticate, authorizeAdmin, attributeValidation, createAttribute);
router.put('/:id', authenticate, authorizeAdmin, attributeValidation, updateAttribute);
router.delete('/:type/:id', authenticate, authorizeAdmin, deleteAttribute);

export default router;
