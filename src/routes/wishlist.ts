// src/routes/wishlist.ts
import express from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist 
} from '../controllers/wishlist';
import { authenticate } from '../middleware/auth';
import { wishlistItemValidation } from '../middleware/validate';

const router = express.Router();

// All wishlist routes are protected
router.get('/', authenticate, getWishlist);
router.post('/', authenticate, wishlistItemValidation, addToWishlist);
router.delete('/:productId', authenticate, removeFromWishlist);
router.delete('/', authenticate, clearWishlist);

export default router;
