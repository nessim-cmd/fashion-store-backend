import { Router } from 'express';
import { getSettings, getSetting, updateSetting, updateSettings } from '../controllers/settings';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Public - get all settings (for frontend)
router.get('/', getSettings);

// Public - get a single setting
router.get('/:key', getSetting);

// Admin only - update a single setting
router.put('/:key', authenticate, isAdmin, updateSetting);

// Admin only - bulk update settings
router.put('/', authenticate, isAdmin, updateSettings);

export default router;
