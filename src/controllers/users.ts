// src/controllers/users.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';
import { hashPassword } from '../utils/password';

// Get all users (admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { page = 1, limit = 10, search } = req.query;
    
    // Build filter
    const filter: any = {};
    if (search) {
      filter.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get users
    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });
    
    // Get total count for pagination
    const total = await prisma.user.count({ where: filter });
    
    // Format response
    const formattedUsers = users.map(user => ({
      ...user,
      orderCount: user._count.orders
    }));
    
    res.json({
      users: formattedUsers,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            orders: true,
            wishlistItems: true,
            cartItems: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format response
    const formattedUser = {
      ...user,
      orderCount: user._count.orders,
      wishlistCount: user._count.wishlistItems,
      cartCount: user._count.cartItems
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin only)
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const isAdmin = req.user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { name, email, isAdmin: setAdmin, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is already used by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Prepare update data
    const updateData: any = {
      name,
      email,
      isAdmin: setAdmin
    };
    
    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting self
    if (id === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update own profile (authenticated user)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update own password (authenticated user)
export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const { comparePassword } = await import('../utils/password');
    const isMatch = await comparePassword(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
