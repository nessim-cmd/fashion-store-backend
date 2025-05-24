import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '@prisma/client';

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin
  };

  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Fallback: Use a hardcoded numeric value (30 days in seconds) for expiresIn
  // 30 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute
  const expiresInSeconds = 30 * 24 * 60 * 60; 

  // Explicitly define options type
  const options: SignOptions = {
    expiresIn: expiresInSeconds // Use the hardcoded number of seconds
  };

  // Ensure secret is treated as Secret type expected by jwt.sign
  return jwt.sign(payload, secret as jwt.Secret, options);
};

// Verify JWT token (keep previous fix)
export const verifyToken = (token: string): any => {
  try {
    const secret = env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.verify(token, secret as jwt.Secret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};
