// src/controllers/coupons.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { validationResult } from 'express-validator';

// Get all active coupons
export const getActiveCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    res.json(coupons);
  } catch (error) {
    console.error('Get active coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validate coupon code
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }
    
    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is inactive' });
    }
    
    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create coupon (admin only)
export const createCoupon = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { code, discount, type, minPurchase, expiresAt, isActive } = req.body;
    
    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });
    
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discount: parseFloat(discount),
        type,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        expiresAt: new Date(expiresAt),
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update coupon (admin only)
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { code, discount, type, minPurchase, expiresAt, isActive } = req.body;
    
    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });
    
    if (!existingCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Check if code is already used by another coupon
    if (code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code }
      });
      
      if (codeExists) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }
    
    // Update coupon
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        discount: parseFloat(discount),
        type,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        expiresAt: new Date(expiresAt),
        isActive
      }
    });
    
    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete coupon (admin only)
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });
    
    if (!existingCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Delete coupon
    await prisma.coupon.delete({
      where: { id }
    });
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
