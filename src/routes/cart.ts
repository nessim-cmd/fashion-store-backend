// src/routes/cart.ts
import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cart';
import { authenticate } from '../middleware/auth';
import { cartItemValidation } from '../middleware/validate';

const router = express.Router();

// All cart routes are protected
router.get('/', authenticate, getCart);
router.post('/', authenticate, cartItemValidation, addToCart);
router.put('/:itemId', authenticate, updateCartItem);
router.delete('/:itemId', authenticate, removeFromCart);
router.delete('/', authenticate, clearCart);

export default router;
