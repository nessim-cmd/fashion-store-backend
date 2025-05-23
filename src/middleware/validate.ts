// src/middleware/validate.ts
import { body } from 'express-validator';

// User validation schemas
export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

export const userUpdateValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Product validation schemas
export const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('images').isArray().withMessage('Images must be an array'),
  body('slug').notEmpty().withMessage('Slug is required')
];

// Category validation schemas
export const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').notEmpty().withMessage('Slug is required')
];

// Cart validation schemas
export const cartItemValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Wishlist validation schemas
export const wishlistItemValidation = [
  body('productId').notEmpty().withMessage('Product ID is required')
];

// Order validation schemas
export const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.streetAddress').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
];

// Coupon validation schemas
export const couponValidation = [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('discount').isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
  body('type').isIn(['PERCENTAGE', 'FIXED']).withMessage('Type must be either PERCENTAGE or FIXED'),
  body('expiresAt').isISO8601().withMessage('Expires at must be a valid date')
];

// Banner validation schemas
export const bannerValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('imageUrl').notEmpty().withMessage('Image URL is required')
];

// Special offer validation schemas
export const specialOfferValidation = [
  body('value').notEmpty().withMessage('Value is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
];

// Attribute validation schemas
export const attributeValidation = [
  body('type').isIn(['size', 'color']).withMessage('Type must be either size or color'),
  body('value').notEmpty().withMessage('Value is required'),
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('colorHex')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color hex must be a valid hex color')
];
