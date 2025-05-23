// src/controllers/attributes.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

// Get all attributes (sizes and colors)
export const getAttributes = async (req: Request, res: Response) => {
  try {
    // Get unique sizes
    const productSizes = await prisma.productSize.findMany({
      select: {
        size: true
      },
      distinct: ['size']
    });
    
    // Get unique colors
    const productColors = await prisma.productColor.findMany({
      select: {
        name: true,
        hex: true
      },
      distinct: ['name', 'hex']
    });
    
    // Format response
    const sizes = productSizes.map(ps => ps.size);
    const colors = productColors.map(pc => ({
      name: pc.name,
      hex: pc.hex
    }));
    
    res.json({
      sizes,
      colors
    });
  } catch (error) {
    console.error('Get attributes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create attribute (admin only)
export const createAttribute = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { type, value, productId, colorHex } = req.body;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Create attribute based on type
    if (type === 'size') {
      // Check if size already exists for this product
      const existingSize = await prisma.productSize.findFirst({
        where: {
          productId,
          size: value
        }
      });
      
      if (existingSize) {
        return res.status(400).json({ message: 'Size already exists for this product' });
      }
      
      // Create size
      const size = await prisma.productSize.create({
        data: {
          productId,
          size: value
        }
      });
      
      res.status(201).json(size);
    } else if (type === 'color') {
      // Check if color already exists for this product
      const existingColor = await prisma.productColor.findFirst({
        where: {
          productId,
          name: value
        }
      });
      
      if (existingColor) {
        return res.status(400).json({ message: 'Color already exists for this product' });
      }
      
      // Create color
      const color = await prisma.productColor.create({
        data: {
          productId,
          name: value,
          hex: colorHex || '#000000'
        }
      });
      
      res.status(201).json(color);
    } else {
      return res.status(400).json({ message: 'Invalid attribute type' });
    }
  } catch (error) {
    console.error('Create attribute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update attribute (admin only)
export const updateAttribute = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { type, value, colorHex } = req.body;
    
    // Update attribute based on type
    if (type === 'size') {
      // Check if size exists
      const existingSize = await prisma.productSize.findUnique({
        where: { id }
      });
      
      if (!existingSize) {
        return res.status(404).json({ message: 'Size not found' });
      }
      
      // Check if new size already exists for this product
      if (value !== existingSize.size) {
        const sizeExists = await prisma.productSize.findFirst({
          where: {
            productId: existingSize.productId,
            size: value
          }
        });
        
        if (sizeExists) {
          return res.status(400).json({ message: 'Size already exists for this product' });
        }
      }
      
      // Update size
      const size = await prisma.productSize.update({
        where: { id },
        data: {
          size: value
        }
      });
      
      res.json(size);
    } else if (type === 'color') {
      // Check if color exists
      const existingColor = await prisma.productColor.findUnique({
        where: { id }
      });
      
      if (!existingColor) {
        return res.status(404).json({ message: 'Color not found' });
      }
      
      // Check if new color already exists for this product
      if (value !== existingColor.name) {
        const colorExists = await prisma.productColor.findFirst({
          where: {
            productId: existingColor.productId,
            name: value
          }
        });
        
        if (colorExists) {
          return res.status(400).json({ message: 'Color already exists for this product' });
        }
      }
      
      // Update color
      const color = await prisma.productColor.update({
        where: { id },
        data: {
          name: value,
          hex: colorHex || existingColor.hex
        }
      });
      
      res.json(color);
    } else {
      return res.status(400).json({ message: 'Invalid attribute type' });
    }
  } catch (error) {
    console.error('Update attribute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete attribute (admin only)
export const deleteAttribute = async (req: AuthRequest, res: Response) => {
  try {
    const { id, type } = req.params;
    
    // Delete attribute based on type
    if (type === 'size') {
      // Check if size exists
      const existingSize = await prisma.productSize.findUnique({
        where: { id }
      });
      
      if (!existingSize) {
        return res.status(404).json({ message: 'Size not found' });
      }
      
      // Delete size
      await prisma.productSize.delete({
        where: { id }
      });
      
      res.json({ message: 'Size deleted successfully' });
    } else if (type === 'color') {
      // Check if color exists
      const existingColor = await prisma.productColor.findUnique({
        where: { id }
      });
      
      if (!existingColor) {
        return res.status(404).json({ message: 'Color not found' });
      }
      
      // Delete color
      await prisma.productColor.delete({
        where: { id }
      });
      
      res.json({ message: 'Color deleted successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid attribute type' });
    }
  } catch (error) {
    console.error('Delete attribute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
