// src/routes/upload.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload base64 image
router.post('/', authenticate, async (req, res) => {
  try {
    const { image, filename } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);
    
    // Save file
    fs.writeFileSync(filePath, buffer);
    
    // Return URL (in production, this would be a CDN URL)
    const imageUrl = `/uploads/${uniqueName}`;
    
    res.json({ url: imageUrl, filename: uniqueName });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
