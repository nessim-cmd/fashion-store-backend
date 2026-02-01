"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNewsletter = exports.sendNewsletter = exports.getNewsletters = exports.createNewsletter = exports.getSubscribers = exports.unsubscribe = exports.subscribe = exports.sendEmail = void 0;
const db_1 = __importDefault(require("../config/db"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Lazy-loaded Bull queue (only if Redis is available)
let emailQueue = null;
let queueInitialized = false;
// Initialize queue lazily to avoid startup crashes
const initializeQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    if (queueInitialized)
        return emailQueue;
    queueInitialized = true;
    // Only try to use Bull if REDIS_URL is explicitly set
    if (!process.env.REDIS_URL) {
        console.log('REDIS_URL not set, using direct email sending');
        return null;
    }
    try {
        const Bull = (yield Promise.resolve().then(() => __importStar(require('bull')))).default;
        emailQueue = new Bull('email-queue', {
            redis: process.env.REDIS_URL,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: true
            }
        });
        // Test connection
        yield emailQueue.isReady();
        console.log('Email queue connected to Redis');
        // Process email jobs
        emailQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
            const { to, subject, html } = job.data;
            const transporter = createTransporter();
            yield transporter.sendMail({
                from: process.env.SMTP_FROM || '"Fashion Store" <noreply@fashionstore.com>',
                to,
                subject,
                html
            });
            return { sent: true, to };
        }));
        emailQueue.on('completed', (job, result) => {
            console.log(`Email sent to ${result.to}`);
        });
        emailQueue.on('failed', (job, err) => {
            console.error(`Failed to send email:`, err.message);
        });
        return emailQueue;
    }
    catch (error) {
        console.log('Redis not available, using direct email sending:', error.message);
        emailQueue = null;
        return null;
    }
});
// Create nodemailer transporter
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};
// Send email (with queue if available)
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const queue = yield initializeQueue();
    if (queue) {
        yield queue.add({ to, subject, html });
    }
    else {
        // Direct send if no queue
        const transporter = createTransporter();
        yield transporter.sendMail({
            from: process.env.SMTP_FROM || '"Fashion Store" <noreply@fashionstore.com>',
            to,
            subject,
            html
        });
    }
});
exports.sendEmail = sendEmail;
// Subscribe to newsletter
const subscribe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Check if already subscribed
        const existing = yield db_1.default.newsletterSubscriber.findUnique({
            where: { email }
        });
        if (existing) {
            if (!existing.isActive) {
                // Reactivate subscription
                yield db_1.default.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true, unsubscribedAt: null }
                });
                return res.json({ message: 'Successfully resubscribed to newsletter!' });
            }
            return res.status(400).json({ message: 'Email already subscribed' });
        }
        yield db_1.default.newsletterSubscriber.create({
            data: {
                email,
                userId
            }
        });
        // Send welcome email
        try {
            yield (0, exports.sendEmail)(email, 'Welcome to Fashion Store Newsletter!', `
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
        `);
        }
        catch (emailError) {
            console.error('Welcome email failed:', emailError);
        }
        res.status(201).json({ message: 'Successfully subscribed to newsletter!' });
    }
    catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.subscribe = subscribe;
// Unsubscribe from newsletter
const unsubscribe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        yield db_1.default.newsletterSubscriber.updateMany({
            where: { email },
            data: { isActive: false, unsubscribedAt: new Date() }
        });
        res.json({ message: 'Successfully unsubscribed' });
    }
    catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.unsubscribe = unsubscribe;
// Get all subscribers (admin)
const getSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, active } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (active === 'true')
            where.isActive = true;
        if (active === 'false')
            where.isActive = false;
        const [subscribers, total] = yield Promise.all([
            db_1.default.newsletterSubscriber.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { subscribedAt: 'desc' }
            }),
            db_1.default.newsletterSubscriber.count({ where })
        ]);
        res.json({
            subscribers,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSubscribers = getSubscribers;
// Create newsletter (admin)
const createNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, content } = req.body;
        const newsletter = yield db_1.default.newsletter.create({
            data: { subject, content }
        });
        res.status(201).json(newsletter);
    }
    catch (error) {
        console.error('Create newsletter error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createNewsletter = createNewsletter;
// Get all newsletters (admin)
const getNewsletters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newsletters = yield db_1.default.newsletter.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(newsletters);
    }
    catch (error) {
        console.error('Get newsletters error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getNewsletters = getNewsletters;
// Send newsletter to all subscribers (admin)
const sendNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const newsletter = yield db_1.default.newsletter.findUnique({
            where: { id }
        });
        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found' });
        }
        // Update status to sending
        yield db_1.default.newsletter.update({
            where: { id },
            data: { status: 'SENDING' }
        });
        // Get active subscribers
        const subscribers = yield db_1.default.newsletterSubscriber.findMany({
            where: { isActive: true }
        });
        let sentCount = 0;
        // Send to all subscribers (batched to prevent server overload)
        for (const subscriber of subscribers) {
            try {
                yield (0, exports.sendEmail)(subscriber.email, newsletter.subject, newsletter.content);
                sentCount++;
            }
            catch (err) {
                console.error(`Failed to send to ${subscriber.email}:`, err);
            }
        }
        // Update newsletter status
        yield db_1.default.newsletter.update({
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
    }
    catch (error) {
        console.error('Send newsletter error:', error);
        // Update status to failed
        yield db_1.default.newsletter.update({
            where: { id: req.params.id },
            data: { status: 'FAILED' }
        });
        res.status(500).json({ message: 'Failed to send newsletter' });
    }
});
exports.sendNewsletter = sendNewsletter;
// Delete newsletter (admin)
const deleteNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db_1.default.newsletter.delete({
            where: { id }
        });
        res.json({ message: 'Newsletter deleted' });
    }
    catch (error) {
        console.error('Delete newsletter error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteNewsletter = deleteNewsletter;
