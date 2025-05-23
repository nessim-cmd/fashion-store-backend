// src/routes/specialOffers.ts
import express from 'express';
import { 
  getActiveSpecialOffers, 
  createSpecialOffer, 
  updateSpecialOffer, 
  deleteSpecialOffer 
} from '../controllers/specialOffers';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { specialOfferValidation } from '../middleware/validate';

const router = express.Router();

// Public routes
router.get('/', getActiveSpecialOffers);

// Admin routes
router.post('/', authenticate, authorizeAdmin, specialOfferValidation, createSpecialOffer);
router.put('/:id', authenticate, authorizeAdmin, specialOfferValidation, updateSpecialOffer);
router.delete('/:id', authenticate, authorizeAdmin, deleteSpecialOffer);

export default router;
