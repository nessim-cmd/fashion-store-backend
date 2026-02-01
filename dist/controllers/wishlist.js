"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get user's wishlist
const getWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Get wishlist items with product details
        const wishlistItems = yield db_1.default.wishlistItem.findMany({
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
        const formattedWishlistItems = wishlistItems.map(item => ({
            id: item.id,
            productId: item.productId,
            product: Object.assign(Object.assign({}, item.product), { sizes: item.product.productSizes.map(ps => ps.size), colors: item.product.productColors.map(pc => ({
                    name: pc.name,
                    hex: pc.hex
                })) })
        }));
        res.json(formattedWishlistItems);
    }
    catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getWishlist = getWishlist;
// Add item to wishlist
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { productId } = req.body;
        // Check if product exists
        const product = yield db_1.default.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Check if item already exists in wishlist
        const existingWishlistItem = yield db_1.default.wishlistItem.findFirst({
            where: {
                userId,
                productId
            }
        });
        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }
        // Create new wishlist item
        const wishlistItem = yield db_1.default.wishlistItem.create({
            data: {
                userId,
                productId
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
        // Format response
        const formattedWishlistItem = {
            id: wishlistItem.id,
            productId: wishlistItem.productId,
            product: Object.assign(Object.assign({}, wishlistItem.product), { sizes: wishlistItem.product.productSizes.map(ps => ps.size), colors: wishlistItem.product.productColors.map(pc => ({
                    name: pc.name,
                    hex: pc.hex
                })) })
        };
        res.status(201).json(formattedWishlistItem);
    }
    catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addToWishlist = addToWishlist;
// Remove item from wishlist
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { productId } = req.params;
        // Check if wishlist item exists and belongs to user
        const existingWishlistItem = yield db_1.default.wishlistItem.findFirst({
            where: {
                userId,
                productId
            }
        });
        if (!existingWishlistItem) {
            return res.status(404).json({ message: 'Wishlist item not found' });
        }
        // Delete wishlist item
        yield db_1.default.wishlistItem.delete({
            where: { id: existingWishlistItem.id }
        });
        res.json({ message: 'Item removed from wishlist' });
    }
    catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.removeFromWishlist = removeFromWishlist;
// Clear wishlist
const clearWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Delete all wishlist items for user
        yield db_1.default.wishlistItem.deleteMany({
            where: { userId }
        });
        res.json({ message: 'Wishlist cleared successfully' });
    }
    catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.clearWishlist = clearWishlist;
