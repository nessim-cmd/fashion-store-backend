// src/controllers/categories.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { validationResult } from 'express-validator';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            subSubcategories: true
          }
        }
      }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: {
            subSubcategories: true
          }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          include: {
            subSubcategories: true
          }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, image, slug } = req.body;
    
    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        slug
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, description, image, slug } = req.body;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if slug is already used by another category
    if (slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });
      
      if (slugExists) {
        return res.status(400).json({ message: 'Category with this slug already exists' });
      }
    }
    
    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        image,
        slug
      }
    });
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Delete category (cascade will handle subcategories)
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
