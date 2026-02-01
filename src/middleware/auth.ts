import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Interface for authenticated request
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

// Authentication middleware
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin authorization middleware
export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Alias for authorizeAdmin
export const isAdmin = authorizeAdmin;
