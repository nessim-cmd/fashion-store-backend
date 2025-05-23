// src/controllers/orders.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { validationResult } from 'express-validator';

// Get user's orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get orders with items
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { id } = req.params;
    
    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to user or user is admin
    if (order.userId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create order
export const createOrder = async (req: AuthRequest, res: Response) => {
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
    
    const { items, shippingAddress, paymentMethod, couponId } = req.body;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.streetAddress || 
        !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // Check coupon if provided
    let coupon = null;
    if (couponId) {
      coupon = await prisma.coupon.findUnique({
        where: { id: couponId }
      });
      
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      
      if (!coupon.isActive || new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Coupon is inactive or expired' });
      }
    }
    
    // Calculate order total
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const { productId, quantity, size, color } = item;
      
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }
      
      // Check if product is in stock
      if (!product.inStock) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }
      
      // Calculate item price
      const price = product.salePrice || product.price;
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      
      // Add to order items
      orderItems.push({
        productId,
        quantity,
        price,
        size,
        color
      });
    }
    
    // Apply coupon discount if available
    let total = subtotal;
    if (coupon) {
      if (coupon.type === 'PERCENTAGE') {
        total = subtotal * (1 - coupon.discount / 100);
      } else if (coupon.type === 'FIXED') {
        total = subtotal - coupon.discount;
      }
      
      // Ensure total is not negative
      total = Math.max(0, total);
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total,
        shippingAddress,
        paymentMethod,
        couponId,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true
      }
    });
    
    // Clear user's cart after successful order
    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        coupon: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get orders
    const orders = await prisma.order.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                salePrice: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });
    
    // Get total count for pagination
    const total = await prisma.order.count({ where: filter });
    
    res.json({
      orders,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
