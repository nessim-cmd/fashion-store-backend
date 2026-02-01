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
exports.getAdminNotifications = exports.createNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get user notifications
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { unreadOnly } = req.query;
        const where = { userId };
        if (unreadOnly === 'true') {
            where.read = false;
        }
        const notifications = yield db_1.default.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        const unreadCount = yield db_1.default.notification.count({
            where: { userId, read: false }
        });
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getNotifications = getNotifications;
// Mark notification as read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const notification = yield db_1.default.notification.updateMany({
            where: { id, userId },
            data: { read: true }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        yield db_1.default.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.markAllAsRead = markAllAsRead;
// Create notification (internal use)
const createNotification = (userId, type, title, message, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db_1.default.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data ? JSON.stringify(data) : null
            }
        });
    }
    catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
});
exports.createNotification = createNotification;
// Get admin notifications (all new orders)
const getAdminNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get recent orders as notifications for admin
        const recentOrders = yield db_1.default.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        const notifications = recentOrders.map(order => ({
            id: order.id,
            type: 'ORDER_PLACED',
            title: 'New Order',
            message: `Order #${order.id.slice(0, 8)} from ${order.user.name}`,
            data: { orderId: order.id, total: order.total },
            read: order.status !== 'PENDING',
            createdAt: order.createdAt
        }));
        const unreadCount = notifications.filter(n => !n.read).length;
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        console.error('Get admin notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAdminNotifications = getAdminNotifications;
