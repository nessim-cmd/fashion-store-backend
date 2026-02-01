import { Request, Response } from 'express';
import prisma from '../config/db';

// Get user notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { unreadOnly } = req.query;
    
    const where: any = { userId };
    if (unreadOnly === 'true') {
      where.read = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create notification (internal use)
export const createNotification = async (
  userId: string,
  type: 'ORDER_PLACED' | 'ORDER_STATUS' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'NEWSLETTER' | 'PROMO',
  title: string,
  message: string,
  data?: any
) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null
      }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Get admin notifications (all new orders)
export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    // Get recent orders as notifications for admin
    const recentOrders = await prisma.order.findMany({
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
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
