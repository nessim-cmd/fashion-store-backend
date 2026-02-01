// src/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import couponRoutes from './routes/coupons';
import bannerRoutes from './routes/banners';
import specialOfferRoutes from './routes/specialOffers';
import userRoutes from './routes/users';
import attributeRoutes from './routes/attributes';
import uploadRoutes from './routes/upload';
import addressRoutes from './routes/addresses';
import settingsRoutes from './routes/settings';
import notificationRoutes from './routes/notifications';
import newsletterRoutes from './routes/newsletter';
import { initializeSettings } from './controllers/settings';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins (reflected) for development convenience
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/special-offers', specialOfferRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Initialize default settings
initializeSettings().catch(console.error);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Seed route (temporary - remove after seeding)
app.get('/api/seed', async (req, res) => {
  try {
    const bcrypt = await import('bcryptjs');
    const { default: prisma } = await import('./config/db');
    
    // Create Admin User
    const password = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { isAdmin: true },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password,
        isAdmin: true,
      },
    });
    
    // Create Categories
    const clothing = await prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Apparel for everyone',
        image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800',
      },
    });

    const shoes = await prisma.category.upsert({
      where: { slug: 'shoes' },
      update: {},
      create: {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Footwear for every occasion',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      },
    });

    const accessories = await prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Complete your look',
        image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=80&w=800',
      },
    });
    
    res.json({ 
      success: true, 
      message: 'Database seeded!',
      admin: { email: 'admin@example.com', password: 'password123' },
      categories: [clothing.name, shoes.name, accessories.name]
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Seeding failed', details: (error as Error).message });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
