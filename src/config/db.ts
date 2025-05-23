import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config( );

// Initialize Prisma client
const prisma = new PrismaClient();

// Export Prisma client
export default prisma;
