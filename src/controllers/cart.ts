// src/controllers/cart.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get cart items with product details
    const cartItems = await prisma.cartItem.findMany({
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
    const formattedCartItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      product: {
        ...item.product,
        sizes: item.product.productSizes.map(ps => ps.size),
        colors: item.product.productColors.map(pc => ({
          name: pc.name,
          hex: pc.hex
        }))
      }
    }));
    
    // Calculate subtotal
    const subtotal = formattedCartItems.reduce(
      (total, item) => total + (item.product.salePrice || item.product.price) * item.quantity,
      0
    );
    
    res.json({
      items: formattedCartItems,
      itemCount: formattedCartItems.reduce((total, item) => total + item.quantity, 0),
      subtotal,
      hasItems: formattedCartItems.length > 0
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
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
    
    const { productId, quantity, selectedSize, selectedColor } = req.body;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is in stock
    if (!product.inStock) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }
    
    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor ? JSON.stringify(selectedColor) : null
      }
    });
    
    let cartItem;
    
    if (existingCartItem) {
      // Update quantity if item exists
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + (quantity || 1)
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: quantity || 1,
          selectedSize,
          selectedColor: selectedColor ? selectedColor : null
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
    }
    
    // Format response
    const formattedCartItem = {
      id: cartItem.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      selectedSize: cartItem.selectedSize,
      selectedColor: cartItem.selectedColor,
      product: {
        ...cartItem.product,
        sizes: cartItem.product.productSizes.map(ps => ps.size),
        colors: cartItem.product.productColors.map(pc => ({
          name: pc.name,
          hex: pc.hex
        }))
      }
    };
    
    res.status(201).json(formattedCartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    });
    
    if (!existingCartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // If quantity is 0 or less, remove item
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId }
      });
      
      return res.json({ message: 'Item removed from cart' });
    }
    
    // Update quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
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
    const formattedCartItem = {
      id: updatedCartItem.id,
      productId: updatedCartItem.productId,
      quantity: updatedCartItem.quantity,
      selectedSize: updatedCartItem.selectedSize,
      selectedColor: updatedCartItem.selectedColor,
      product: {
        ...updatedCartItem.product,
        sizes: updatedCartItem.product.productSizes.map(ps => ps.size),
        colors: updatedCartItem.product.productColors.map(pc => ({
          name: pc.name,
          hex: pc.hex
        }))
      }
    };
    
    res.json(formattedCartItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { itemId } = req.params;
    
    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    });
    
    if (!existingCartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Delete all cart items for user
    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
