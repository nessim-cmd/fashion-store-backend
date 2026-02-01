// src/routes/users.ts
import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  updateProfile,
  updatePassword
} from '../controllers/users';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { userUpdateValidation } from '../middleware/validate';

const router = express.Router();

// Self-update routes (authenticated users)
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);

// Admin-only routes
router.get('/', authenticate, authorizeAdmin, getUsers);
router.get('/:id', authenticate, authorizeAdmin, getUserById);
router.put('/:id', authenticate, authorizeAdmin, userUpdateValidation, updateUser);
router.delete('/:id', authenticate, authorizeAdmin, deleteUser);

export default router;
