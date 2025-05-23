// src/routes/orders.ts
import express from 'express';
import { 
  getUserOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  getAllOrders 
} from '../controllers/orders';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { orderValidation } from '../middleware/validate';

const router = express.Router();

// User routes (protected)
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, orderValidation, createOrder);

// Admin routes
router.put('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);
router.get('/admin/all', authenticate, authorizeAdmin, getAllOrders);

export default router;
