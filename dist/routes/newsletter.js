"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsletter_1 = require("../controllers/newsletter");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public - subscribe to newsletter
router.post('/subscribe', newsletter_1.subscribe);
// Public - unsubscribe
router.post('/unsubscribe', newsletter_1.unsubscribe);
// Admin - get subscribers
router.get('/subscribers', auth_1.authenticate, auth_1.isAdmin, newsletter_1.getSubscribers);
// Admin - newsletter CRUD
router.get('/', auth_1.authenticate, auth_1.isAdmin, newsletter_1.getNewsletters);
router.post('/', auth_1.authenticate, auth_1.isAdmin, newsletter_1.createNewsletter);
router.post('/:id/send', auth_1.authenticate, auth_1.isAdmin, newsletter_1.sendNewsletter);
router.delete('/:id', auth_1.authenticate, auth_1.isAdmin, newsletter_1.deleteNewsletter);
exports.default = router;
