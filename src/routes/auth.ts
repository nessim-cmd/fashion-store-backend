// src/routes/auth.ts
import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation } from '../middleware/validate';

const router = express.Router();

// Register a new user
router.post('/register', registerValidation, register);

// Login user
router.post('/login', loginValidation, login);

// Get current user (protected route)
router.get('/me', authenticate, getCurrentUser);

// Logout user (client-side only, just for API completeness)
router.post('/logout', logout);

export default router;
