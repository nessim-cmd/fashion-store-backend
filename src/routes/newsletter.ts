import { Router } from 'express';
import { 
  subscribe, 
  unsubscribe, 
  getSubscribers, 
  createNewsletter, 
  getNewsletters, 
  sendNewsletter,
  deleteNewsletter 
} from '../controllers/newsletter';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Public - subscribe to newsletter
router.post('/subscribe', subscribe);

// Public - unsubscribe
router.post('/unsubscribe', unsubscribe);

// Admin - get subscribers
router.get('/subscribers', authenticate, isAdmin, getSubscribers);

// Admin - newsletter CRUD
router.get('/', authenticate, isAdmin, getNewsletters);
router.post('/', authenticate, isAdmin, createNewsletter);
router.post('/:id/send', authenticate, isAdmin, sendNewsletter);
router.delete('/:id', authenticate, isAdmin, deleteNewsletter);

export default router;
