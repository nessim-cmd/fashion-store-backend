// src/routes/coupons.ts
import express from 'express';
import { 
  getActiveCoupons, 
  getAllCoupons,
  validateCoupon, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon 
} from '../controllers/coupons';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { couponValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getActiveCoupons);
router.get('/validate/:code', validateCoupon);

// Admin routes
router.get('/admin/all', authenticate, authorizeAdmin, getAllCoupons);
router.post('/', authenticate, authorizeAdmin, couponValidation, createCoupon);
router.put('/:id', authenticate, authorizeAdmin, couponValidation, updateCoupon);
router.delete('/:id', authenticate, authorizeAdmin, deleteCoupon);

export default router;
