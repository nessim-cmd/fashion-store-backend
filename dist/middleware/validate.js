"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributeValidation = exports.specialOfferValidation = exports.bannerValidation = exports.couponValidation = exports.orderValidation = exports.wishlistItemValidation = exports.cartItemValidation = exports.categoryValidation = exports.productValidation = exports.userUpdateValidation = exports.loginValidation = exports.registerValidation = void 0;
// src/middleware/validate.ts
const express_validator_1 = require("express-validator");
// User validation schemas
exports.registerValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
exports.userUpdateValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];
// Product validation schemas
exports.productValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('images').isArray().withMessage('Images must be an array'),
    (0, express_validator_1.body)('slug').notEmpty().withMessage('Slug is required')
];
// Category validation schemas
exports.categoryValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Category name is required'),
    (0, express_validator_1.body)('slug').notEmpty().withMessage('Slug is required')
];
// Cart validation schemas
exports.cartItemValidation = [
    (0, express_validator_1.body)('productId').notEmpty().withMessage('Product ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];
// Wishlist validation schemas
exports.wishlistItemValidation = [
    (0, express_validator_1.body)('productId').notEmpty().withMessage('Product ID is required')
];
// Order validation schemas
exports.orderValidation = [
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    (0, express_validator_1.body)('items.*.productId').notEmpty().withMessage('Product ID is required'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('shippingAddress.streetAddress').notEmpty().withMessage('Street address is required'),
    (0, express_validator_1.body)('shippingAddress.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    (0, express_validator_1.body)('shippingAddress.country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('paymentMethod').notEmpty().withMessage('Payment method is required')
];
// Coupon validation schemas
exports.couponValidation = [
    (0, express_validator_1.body)('code').notEmpty().withMessage('Coupon code is required'),
    (0, express_validator_1.body)('discount').isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
    (0, express_validator_1.body)('type').isIn(['PERCENTAGE', 'FIXED']).withMessage('Type must be either PERCENTAGE or FIXED'),
    (0, express_validator_1.body)('expiresAt').isISO8601().withMessage('Expires at must be a valid date')
];
// Banner validation schemas
exports.bannerValidation = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('imageUrl').notEmpty().withMessage('Image URL is required')
];
// Special offer validation schemas
exports.specialOfferValidation = [
    (0, express_validator_1.body)('value').notEmpty().withMessage('Value is required'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required')
];
// Attribute validation schemas
exports.attributeValidation = [
    (0, express_validator_1.body)('type').isIn(['size', 'color']).withMessage('Type must be either size or color'),
    (0, express_validator_1.body)('value').notEmpty().withMessage('Value is required'),
    (0, express_validator_1.body)('productId').notEmpty().withMessage('Product ID is required'),
    (0, express_validator_1.body)('colorHex')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Color hex must be a valid hex color')
];
