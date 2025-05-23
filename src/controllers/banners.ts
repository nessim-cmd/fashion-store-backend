// src/controllers/banners.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { validationResult } from 'express-validator';

// Get all active banners
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(banners);
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create banner (admin only)
export const createBanner = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, subtitle, imageUrl, linkUrl, isActive } = req.body;
    
    // Create banner
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(banner);
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update banner (admin only)
export const updateBanner = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { title, subtitle, imageUrl, linkUrl, isActive } = req.body;
    
    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });
    
    if (!existingBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    // Update banner
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        isActive
      }
    });
    
    res.json(banner);
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete banner (admin only)
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });
    
    if (!existingBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    // Delete banner
    await prisma.banner.delete({
      where: { id }
    });
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
