// src/controllers/specialOffers.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { validationResult } from 'express-validator';

// Get all active special offers
export const getActiveSpecialOffers = async (req: Request, res: Response) => {
  try {
    const specialOffers = await prisma.specialOffer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(specialOffers);
  } catch (error) {
    console.error('Get active special offers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create special offer (admin only)
export const createSpecialOffer = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { value, title, description, buttonText, linkUrl, isActive } = req.body;
    
    // Create special offer
    const specialOffer = await prisma.specialOffer.create({
      data: {
        value,
        title,
        description,
        buttonText,
        linkUrl,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(specialOffer);
  } catch (error) {
    console.error('Create special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update special offer (admin only)
export const updateSpecialOffer = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { value, title, description, buttonText, linkUrl, isActive } = req.body;
    
    // Check if special offer exists
    const existingSpecialOffer = await prisma.specialOffer.findUnique({
      where: { id }
    });
    
    if (!existingSpecialOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }
    
    // Update special offer
    const specialOffer = await prisma.specialOffer.update({
      where: { id },
      data: {
        value,
        title,
        description,
        buttonText,
        linkUrl,
        isActive
      }
    });
    
    res.json(specialOffer);
  } catch (error) {
    console.error('Update special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete special offer (admin only)
export const deleteSpecialOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if special offer exists
    const existingSpecialOffer = await prisma.specialOffer.findUnique({
      where: { id }
    });
    
    if (!existingSpecialOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }
    
    // Delete special offer
    await prisma.specialOffer.delete({
      where: { id }
    });
    
    res.json({ message: 'Special offer deleted successfully' });
  } catch (error) {
    console.error('Delete special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
