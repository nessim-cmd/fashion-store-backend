// src/controllers/products.ts
import { Request, Response } from 'express';
import prisma from '../config/db';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

// Get all products with filtering
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      subcategory, 
      subSubcategory,
      featured,
      inStock,
      minPrice,
      maxPrice,
      search,
      sort,
      limit = 10,
      page = 1
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    // Support both category ID and category name/slug
    if (category) {
      const categoryStr = category as string;
      // Check if it's a UUID or a name/slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryStr);
      if (isUUID) {
        filter.categoryId = categoryStr;
      } else {
        // First find the category by name or slug
        const foundCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { equals: categoryStr, mode: 'insensitive' } },
              { slug: { equals: categoryStr.toLowerCase() } }
            ]
          }
        });
        if (foundCategory) {
          filter.categoryId = foundCategory.id;
        } else {
          // No category found, return empty results
          return res.json({ products: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
        }
      }
    }
    if (subcategory) filter.subcategoryId = subcategory as string;
    if (subSubcategory) filter.subSubcategoryId = subSubcategory as string;
    if (featured === 'true') filter.featured = true;
    if (inStock === 'true') filter.inStock = true;
    
    // Search by name or description
    if (search) {
      filter.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // Price range
    if (minPrice || maxPrice) {
      filter.AND = [];
      if (minPrice) filter.AND.push({ price: { gte: parseFloat(minPrice as string) } });
      if (maxPrice) filter.AND.push({ price: { lte: parseFloat(maxPrice as string) } });
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get products
    const products = await prisma.product.findMany({
      where: filter,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        category: true,
        subcategory: true,
        subSubcategory: true,
        productSizes: true,
        productColors: true,
        images: true
      }
    });
    
    // Get total count for pagination
    const total = await prisma.product.count({ where: filter });
    
    // Format response
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images.map(img => img.url),
      sizes: product.productSizes.map(ps => ps.size),
      colors: product.productColors.map(pc => ({
        name: pc.name,
        hex: pc.hex
      }))
    }));
    
    res.json({
      products: formattedProducts,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: {
        category: true,
        productSizes: true,
        productColors: true,
        images: true
      },
      take: 8
    });
    
    // Format response
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images.map(img => img.url),
      sizes: product.productSizes.map(ps => ps.size),
      colors: product.productColors.map(pc => ({
        name: pc.name,
        hex: pc.hex
      }))
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        subSubcategory: true,
        productSizes: true,
        productColors: true,
        images: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Format response
    const formattedProduct = {
      ...product,
      images: product.images.map(img => img.url),
      sizes: product.productSizes.map(ps => ps.size),
      colors: product.productColors.map(pc => ({
        name: pc.name,
        hex: pc.hex
      }))
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by slug
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        subSubcategory: true,
        productSizes: true,
        productColors: true,
        images: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Format response
    const formattedProduct = {
      ...product,
      images: product.images.map(img => img.url),
      sizes: product.productSizes.map(ps => ps.size),
      colors: product.productColors.map(pc => ({
        name: pc.name,
        hex: pc.hex
      }))
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product (admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      name, 
      description, 
      price, 
      salePrice, 
      images, 
      categoryId, 
      subcategoryId, 
      subSubcategoryId,
      featured,
      inStock,
      slug: providedSlug,
      sizes,
      colors
    } = req.body;
    
    // Generate unique slug
    let slug = providedSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug exists and make it unique
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Ensure images is an array
    const imageUrls = Array.isArray(images) ? images.filter((img: string) => img && img.trim()) : [];
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price) || 0,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: imageUrls.length > 0 ? {
          create: imageUrls.map((url: string) => ({ url }))
        } : undefined,
        categoryId,
        subcategoryId: subcategoryId || null,
        subSubcategoryId: subSubcategoryId || null,
        featured: featured || false,
        inStock: inStock !== undefined ? inStock : true,
        rating: 0,
        reviewCount: 0,
        slug
      }
    });
    
    // Add sizes if provided
    if (sizes && sizes.length > 0) {
      await Promise.all(
        sizes.map((size: string) =>
          prisma.productSize.create({
            data: {
              size,
              productId: product.id
            }
          })
        )
      );
    }
    
    // Add colors if provided
    if (colors && colors.length > 0) {
      await Promise.all(
        colors.map((color: { name: string; hex: string }) =>
          prisma.productColor.create({
            data: {
              name: color.name,
              hex: color.hex,
              productId: product.id
            }
          })
        )
      );
    }
    
    // Get complete product with relations
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        subcategory: true,
        subSubcategory: true,
        productSizes: true,
        productColors: true,
        images: true
      }
    });
    
    // Format response
    const formattedProduct = {
      ...createdProduct,
      images: createdProduct?.images.map(img => img.url) || [],
      sizes: createdProduct?.productSizes.map(ps => ps.size) || [],
      colors: createdProduct?.productColors.map(pc => ({
        name: pc.name,
        hex: pc.hex
      })) || []
    };
    
    res.status(201).json(formattedProduct);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      code: error.code 
    });
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      salePrice, 
      images, 
      categoryId, 
      subcategoryId, 
      subSubcategoryId,
      featured,
      inStock,
      slug,
      sizes,
      colors
    } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: {
          deleteMany: {},
          create: (images as string[]).map(url => ({ url }))
        },
        categoryId,
        subcategoryId,
        subSubcategoryId,
        featured,
        inStock,
        slug
      }
    });
    
    // Update sizes if provided
    if (sizes) {
      // Delete existing sizes
      await prisma.productSize.deleteMany({
        where: { productId: id }
      });
      
      // Add new sizes
      if (sizes.length > 0) {
        await Promise.all(
          sizes.map((size: string) =>
            prisma.productSize.create({
              data: {
                size,
                productId: product.id
              }
            })
          )
        );
      }
    }
    
    // Update colors if provided
    if (colors) {
      // Delete existing colors
      await prisma.productColor.deleteMany({
        where: { productId: id }
      });
      
      // Add new colors
      if (colors.length > 0) {
        await Promise.all(
          colors.map((color: { name: string; hex: string }) =>
            prisma.productColor.create({
              data: {
                name: color.name,
                hex: color.hex,
                productId: product.id
              }
            })
          )
        );
      }
    }
    
    // Get updated product with relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        subSubcategory: true,
        productSizes: true,
        productColors: true,
        images: true
      }
    });
    
    // Format response
    const formattedProduct = {
      ...updatedProduct,
      images: updatedProduct?.images.map(img => img.url) || [],
      sizes: updatedProduct?.productSizes.map(ps => ps.size) || [],
      colors: updatedProduct?.productColors.map(pc => ({
        name: pc.name,
        hex: pc.hex
      })) || []
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
