import { Request, Response } from 'express';
import prisma from '../config/db';

// Get all settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findMany();
    
    // Convert to object format
    const settingsObj: Record<string, string> = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single setting by key
export const getSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await prisma.settings.findUnique({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update or create a setting (upsert)
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    res.json(setting);
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk update settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body; // { currency: 'USD', language: 'en', ... }
    
    const updates = Object.entries(settings).map(([key, value]) => 
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    );
    
    await prisma.$transaction(updates);
    
    // Return updated settings
    const allSettings = await prisma.settings.findMany();
    const settingsObj: Record<string, string> = {};
    allSettings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Initialize default settings
export const initializeSettings = async () => {
  const defaults = [
    { key: 'currency', value: 'USD' },
    { key: 'currencySymbol', value: '$' },
    { key: 'language', value: 'en' },
    { key: 'storeName', value: 'Fashion Store' },
    { key: 'storeEmail', value: 'contact@fashionstore.com' },
    { key: 'taxRate', value: '0' },
    { key: 'shippingFee', value: '0' },
    { key: 'freeShippingThreshold', value: '100' },
  ];

  for (const setting of defaults) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }
};
