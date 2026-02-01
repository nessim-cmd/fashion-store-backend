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
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const db_1 = __importDefault(require("../config/db"));
const client_1 = require("@prisma/client"); // Added Prisma import
const express_validator_1 = require("express-validator");
// Get user's cart
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Get cart items with product details
        const cartItems = yield db_1.default.cartItem.findMany({
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
        const formattedCartItems = cartItems.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            product: Object.assign(Object.assign({}, item.product), { sizes: item.product.productSizes.map(ps => ps.size), colors: item.product.productColors.map(pc => ({
                    name: pc.name,
                    hex: pc.hex
                })) })
        }));
        // Calculate subtotal
        const subtotal = formattedCartItems.reduce((total, item) => total + (item.product.salePrice || item.product.price) * item.quantity, 0);
        res.json({
            items: formattedCartItems,
            itemCount: formattedCartItems.reduce((total, item) => total + item.quantity, 0),
            subtotal,
            hasItems: formattedCartItems.length > 0
        });
    }
    catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCart = getCart;
// Add item to cart
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { productId, quantity, selectedSize, selectedColor } = req.body;
        // Check if product exists
        const product = yield db_1.default.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Check if product is in stock
        if (!product.inStock) {
            return res.status(400).json({ message: 'Product is out of stock' });
        }
        // Check if item already exists in cart
        const existingCartItem = yield db_1.default.cartItem.findFirst({
            where: {
                userId,
                productId,
                selectedSize: selectedSize || null,
                selectedColor: selectedColor ? selectedColor : client_1.Prisma.JsonNull
            }
        });
        let cartItem;
        if (existingCartItem) {
            // Update quantity if item exists
            cartItem = yield db_1.default.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: existingCartItem.quantity + (quantity || 1)
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
        }
        else {
            // Create new cart item
            cartItem = yield db_1.default.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity: quantity || 1,
                    selectedSize,
                    selectedColor: selectedColor ? selectedColor : null
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
        }
        // Format response
        const formattedCartItem = {
            id: cartItem.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            selectedSize: cartItem.selectedSize,
            selectedColor: cartItem.selectedColor,
            product: Object.assign(Object.assign({}, cartItem.product), { sizes: cartItem.product.productSizes.map(ps => ps.size), colors: cartItem.product.productColors.map(pc => ({
                    name: pc.name,
                    hex: pc.hex
                })) })
        };
        res.status(201).json(formattedCartItem);
    }
    catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addToCart = addToCart;
// Update cart item quantity
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { itemId } = req.params;
        const { quantity } = req.body;
        // Check if cart item exists and belongs to user
        const existingCartItem = yield db_1.default.cartItem.findFirst({
            where: {
                id: itemId,
                userId
            }
        });
        if (!existingCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        // If quantity is 0 or less, remove item
        if (quantity <= 0) {
            yield db_1.default.cartItem.delete({
                where: { id: itemId }
            });
            return res.json({ message: 'Item removed from cart' });
        }
        // Update quantity
        const updatedCartItem = yield db_1.default.cartItem.update({
            where: { id: itemId },
            data: { quantity },
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
        const formattedCartItem = {
            id: updatedCartItem.id,
            productId: updatedCartItem.productId,
            quantity: updatedCartItem.quantity,
            selectedSize: updatedCartItem.selectedSize,
            selectedColor: updatedCartItem.selectedColor,
            product: Object.assign(Object.assign({}, updatedCartItem.product), { sizes: updatedCartItem.product.productSizes.map(ps => ps.size), colors: updatedCartItem.product.productColors.map(pc => ({
                    name: pc.name,
                    hex: pc.hex
                })) })
        };
        res.json(formattedCartItem);
    }
    catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { itemId } = req.params;
        // Check if cart item exists and belongs to user
        const existingCartItem = yield db_1.default.cartItem.findFirst({
            where: {
                id: itemId,
                userId
            }
        });
        if (!existingCartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        // Delete cart item
        yield db_1.default.cartItem.delete({
            where: { id: itemId }
        });
        res.json({ message: 'Item removed from cart' });
    }
    catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.removeFromCart = removeFromCart;
// Clear cart
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Delete all cart items for user
        yield db_1.default.cartItem.deleteMany({
            where: { userId }
        });
        res.json({ message: 'Cart cleared successfully' });
    }
    catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.clearCart = clearCart;
