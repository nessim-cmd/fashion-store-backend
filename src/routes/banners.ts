// src/routes/banners.ts
import express from 'express';
import { 
  getActiveBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner 
} from '../controllers/banners';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { bannerValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getActiveBanners);

// Admin routes
router.post('/', authenticate, authorizeAdmin, bannerValidation, createBanner);
router.put('/:id', authenticate, authorizeAdmin, bannerValidation, updateBanner);
router.delete('/:id', authenticate, authorizeAdmin, deleteBanner);

export default router;
