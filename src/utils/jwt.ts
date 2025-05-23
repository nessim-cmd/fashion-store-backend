import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '@prisma/client';

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin
  };

  // Fix: Cast JWT_SECRET to string and provide default expiration
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    payload, 
    secret, 
    {
      expiresIn: env.JWT_EXPIRES_IN || '30d'
    }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    // Fix: Cast JWT_SECRET to string
    const secret = env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};