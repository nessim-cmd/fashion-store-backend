// src/controllers/wishlist.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';

// Get user's wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get wishlist items with product details
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            productSizes: true,
            productColors: true
          }
        }
      }
    });
    
    // Format response
    const formattedWishlistItems = wishlistItems.map(item => ({
      id: item.id,
      productId: item.productId,
      product: {
        ...item.product,
        sizes: item.product.productSizes.map(ps => ps.size),
        colors: item.product.productColors.map(pc => ({
          name: pc.name,
          hex: pc.hex
        }))
      }
    }));
    
    res.json(formattedWishlistItems);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { productId } = req.body;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if item already exists in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId
      }
    });
    
    if (existingWishlistItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Create new wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            productSizes: true,
            productColors: true
          }
        }
      }
    });
    
    // Format response
    const formattedWishlistItem = {
      id: wishlistItem.id,
      productId: wishlistItem.productId,
      product: {
        ...wishlistItem.product,
        sizes: wishlistItem.product.productSizes.map(ps => ps.size),
        colors: wishlistItem.product.productColors.map(pc => ({
          name: pc.name,
          hex: pc.hex
        }))
      }
    };
    
    res.status(201).json(formattedWishlistItem);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { productId } = req.params;
    
    // Check if wishlist item exists and belongs to user
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId
      }
    });
    
    if (!existingWishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    
    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id: existingWishlistItem.id }
    });
    
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear wishlist
export const clearWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Delete all wishlist items for user
    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });
    
    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
