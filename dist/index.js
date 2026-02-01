"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("./config/env");
const error_1 = require("./middleware/error");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const cart_1 = __importDefault(require("./routes/cart"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const orders_1 = __importDefault(require("./routes/orders"));
const coupons_1 = __importDefault(require("./routes/coupons"));
const banners_1 = __importDefault(require("./routes/banners"));
const specialOffers_1 = __importDefault(require("./routes/specialOffers"));
const users_1 = __importDefault(require("./routes/users"));
const attributes_1 = __importDefault(require("./routes/attributes"));
const upload_1 = __importDefault(require("./routes/upload"));
const addresses_1 = __importDefault(require("./routes/addresses"));
const settings_1 = __importDefault(require("./routes/settings"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const newsletter_1 = __importDefault(require("./routes/newsletter"));
const settings_2 = require("./controllers/settings");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// CORS configuration
app.use((0, cors_1.default)({
    origin: true, // Allow all origins (reflected) for development convenience
    credentials: true
}));
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/wishlist', wishlist_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/coupons', coupons_1.default);
app.use('/api/banners', banners_1.default);
app.use('/api/special-offers', specialOffers_1.default);
app.use('/api/users', users_1.default);
app.use('/api/attributes', attributes_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/addresses', addresses_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/newsletter', newsletter_1.default);
// Initialize default settings
(0, settings_2.initializeSettings)().catch(console.error);
// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
// Error handling middleware
app.use(error_1.notFound);
app.use(error_1.errorHandler);
// Start server
const PORT = env_1.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${env_1.env.NODE_ENV} mode on port ${PORT}`);
});
exports.default = app;
