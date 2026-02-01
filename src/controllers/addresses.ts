import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

// Get all addresses for the logged-in user
export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Failed to get addresses' });
  }
};

// Create a new address
export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    // Validate required fields
    if (!name || !phone || !street || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    // Check if this is the first address, make it default
    const existingCount = await prisma.address.count({
      where: { userId: req.user!.id },
    });

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        name,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || existingCount === 0,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: 'Failed to create address' });
  }
};

// Update an address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    // Check if address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        name,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      },
    });

    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
};

// Delete an address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    // If this was the default, make another one default
    if (existing.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
};

// Set an address as default
export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });

    // Set this one as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json(address);
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
};
