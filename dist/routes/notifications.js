"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_1 = require("../controllers/notifications");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get user's notifications
router.get('/', auth_1.authenticate, notifications_1.getNotifications);
// Get admin notifications (orders, etc.)
router.get('/admin', auth_1.authenticate, auth_1.isAdmin, notifications_1.getAdminNotifications);
// Mark single notification as read
router.put('/:id/read', auth_1.authenticate, notifications_1.markAsRead);
// Mark all notifications as read
router.put('/read-all', auth_1.authenticate, notifications_1.markAllAsRead);
exports.default = router;
