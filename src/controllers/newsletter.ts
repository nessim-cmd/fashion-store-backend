import { Request, Response } from 'express';
import prisma from '../config/db';
import nodemailer from 'nodemailer';
import Bull from 'bull';

// Create email queue (uses Redis if available, falls back to in-memory)
let emailQueue: Bull.Queue | null = null;

try {
  emailQueue = new Bull('email-queue', {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    }
  });
  console.log('Email queue connected to Redis');
} catch (error) {
  console.log('Redis not available, using direct email sending');
}

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Process email jobs
if (emailQueue) {
  emailQueue.process(async (job) => {
    const { to, subject, html } = job.data;
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Fashion Store" <noreply@fashionstore.com>',
      to,
      subject,
      html
    });
    
    return { sent: true, to };
  });

  emailQueue.on('completed', (job, result) => {
    console.log(`Email sent to ${result.to}`);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`Failed to send email:`, err.message);
  });
}

// Send email (with queue if available)
export const sendEmail = async (to: string, subject: string, html: string) => {
  if (emailQueue) {
    await emailQueue.add({ to, subject, html });
  } else {
    // Direct send if no queue
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Fashion Store" <noreply@fashionstore.com>',
      to,
      subject,
      html
    });
  }
};

// Subscribe to newsletter
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userId = (req as any).user?.id;
    
    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });
    
    if (existing) {
      if (!existing.isActive) {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true, unsubscribedAt: null }
        });
        return res.json({ message: 'Successfully resubscribed to newsletter!' });
      }
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        userId
      }
    });
    
    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to Fashion Store Newsletter!',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">Welcome to Fashion Store!</h1>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>You'll be the first to know about:</p>
          <ul>
            <li>New arrivals</li>
            <li>Exclusive discounts</li>
            <li>Fashion tips & trends</li>
          </ul>
          <p>Happy shopping!</p>
        </div>
        `
      );
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }
    
    res.status(201).json({ message: 'Successfully subscribed to newsletter!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unsubscribe from newsletter
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() }
    });
    
    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all subscribers (admin)
export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;
    
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { subscribedAt: 'desc' }
      }),
      prisma.newsletterSubscriber.count({ where })
    ]);
    
    res.json({
      subscribers,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create newsletter (admin)
export const createNewsletter = async (req: Request, res: Response) => {
  try {
    const { subject, content } = req.body;
    
    const newsletter = await prisma.newsletter.create({
      data: { subject, content }
    });
    
    res.status(201).json(newsletter);
  } catch (error) {
    console.error('Create newsletter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all newsletters (admin)
export const getNewsletters = async (req: Request, res: Response) => {
  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(newsletters);
  } catch (error) {
    console.error('Get newsletters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send newsletter to all subscribers (admin)
export const sendNewsletter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const newsletter = await prisma.newsletter.findUnique({
      where: { id }
    });
    
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }
    
    // Update status to sending
    await prisma.newsletter.update({
      where: { id },
      data: { status: 'SENDING' }
    });
    
    // Get active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true }
    });
    
    let sentCount = 0;
    
    // Send to all subscribers (batched to prevent server overload)
    for (const subscriber of subscribers) {
      try {
        await sendEmail(subscriber.email, newsletter.subject, newsletter.content);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err);
      }
    }
    
    // Update newsletter status
    await prisma.newsletter.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount
      }
    });
    
    res.json({ 
      message: `Newsletter sent to ${sentCount} subscribers`,
      sentCount 
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    
    // Update status to failed
    await prisma.newsletter.update({
      where: { id: req.params.id },
      data: { status: 'FAILED' }
    });
    
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
};

// Delete newsletter (admin)
export const deleteNewsletter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.newsletter.delete({
      where: { id }
    });
    
    res.json({ message: 'Newsletter deleted' });
  } catch (error) {
    console.error('Delete newsletter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
