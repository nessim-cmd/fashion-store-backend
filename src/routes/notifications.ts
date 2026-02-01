import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, getAdminNotifications } from '../controllers/notifications';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Get user's notifications
router.get('/', authenticate, getNotifications);

// Get admin notifications (orders, etc.)
router.get('/admin', authenticate, isAdmin, getAdminNotifications);

// Mark single notification as read
router.put('/:id/read', authenticate, markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

export default router;
