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
exports.getAllOrders = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getUserOrders = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const notifications_1 = require("./notifications");
// Get user's orders
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Get orders with items
        const orders = yield db_1.default.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                coupon: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserOrders = getUserOrders;
// Get order by ID
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isAdmin = (_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { id } = req.params;
        // Get order with items
        const order = yield db_1.default.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                coupon: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Check if order belongs to user or user is admin
        if (order.userId !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getOrderById = getOrderById;
// Create order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { items, shippingAddress, paymentMethod, couponId } = req.body;
        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }
        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.streetAddress ||
            !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }
        // Validate payment method
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }
        // Check coupon if provided
        let coupon = null;
        if (couponId) {
            coupon = yield db_1.default.coupon.findUnique({
                where: { id: couponId }
            });
            if (!coupon) {
                return res.status(404).json({ message: 'Coupon not found' });
            }
            if (!coupon.isActive || new Date(coupon.expiresAt) < new Date()) {
                return res.status(400).json({ message: 'Coupon is inactive or expired' });
            }
        }
        // Calculate order total
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const { productId, quantity, size, color } = item;
            // Check if product exists
            const product = yield db_1.default.product.findUnique({
                where: { id: productId }
            });
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${productId} not found` });
            }
            // Check if product is in stock
            if (!product.inStock) {
                return res.status(400).json({ message: `Product ${product.name} is out of stock` });
            }
            // Calculate item price
            const price = product.salePrice || product.price;
            const itemTotal = price * quantity;
            subtotal += itemTotal;
            // Add to order items
            orderItems.push({
                productId,
                quantity,
                price,
                size,
                color
            });
        }
        // Apply coupon discount if available
        let total = subtotal;
        if (coupon) {
            if (coupon.type === 'PERCENTAGE') {
                total = subtotal * (1 - coupon.discount / 100);
            }
            else if (coupon.type === 'FIXED') {
                total = subtotal - coupon.discount;
            }
            // Ensure total is not negative
            total = Math.max(0, total);
        }
        // Create order
        const order = yield db_1.default.order.create({
            data: {
                userId,
                status: 'PENDING',
                total,
                shippingAddress,
                paymentMethod,
                couponId,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                coupon: true
            }
        });
        // Clear user's cart after successful order
        yield db_1.default.cartItem.deleteMany({
            where: { userId }
        });
        // Create notification for customer
        try {
            yield (0, notifications_1.createNotification)(userId, 'ORDER_PLACED', 'Order Confirmed!', `Your order #${order.id.slice(0, 8)} has been placed successfully. Total: $${total.toFixed(2)}`, { orderId: order.id, total });
        }
        catch (notifError) {
            console.error('Failed to create order notification:', notifError);
        }
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createOrder = createOrder;
// Update order status (admin only)
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { id } = req.params;
        const { status } = req.body;
        // Validate status
        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }
        // Check if order exists
        const existingOrder = yield db_1.default.order.findUnique({
            where: { id }
        });
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Update order status
        const order = yield db_1.default.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                coupon: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        // Create notification for customer
        const statusMessages = {
            'PROCESSING': {
                title: 'Order Being Processed',
                message: `Your order #${id.slice(0, 8)} is now being processed.`,
                type: 'ORDER_STATUS'
            },
            'SHIPPED': {
                title: 'Order Shipped!',
                message: `Great news! Your order #${id.slice(0, 8)} has been shipped.`,
                type: 'ORDER_SHIPPED'
            },
            'DELIVERED': {
                title: 'Order Delivered',
                message: `Your order #${id.slice(0, 8)} has been delivered. Enjoy!`,
                type: 'ORDER_DELIVERED'
            },
            'CANCELLED': {
                title: 'Order Cancelled',
                message: `Your order #${id.slice(0, 8)} has been cancelled.`,
                type: 'ORDER_STATUS'
            }
        };
        if (statusMessages[status]) {
            try {
                yield (0, notifications_1.createNotification)(existingOrder.userId, statusMessages[status].type, statusMessages[status].title, statusMessages[status].message, { orderId: id });
            }
            catch (notifError) {
                console.error('Failed to create notification:', notifError);
            }
        }
        res.json(order);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Get all orders (admin only)
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { status, page = 1, limit = 10 } = req.query;
        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get orders
        const orders = yield db_1.default.order.findMany({
            where: filter,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                salePrice: true,
                                images: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit)
        });
        // Get total count for pagination
        const total = yield db_1.default.order.count({ where: filter });
        res.json({
            orders,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllOrders = getAllOrders;
