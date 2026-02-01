"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/products.ts
const express_1 = __importDefault(require("express"));
const products_1 = require("../controllers/products");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Public routes
router.get('/', products_1.getProducts);
router.get('/featured', products_1.getFeaturedProducts);
router.get('/:id', products_1.getProductById);
router.get('/slug/:slug', products_1.getProductBySlug);
// Protected admin routes
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.productValidation, products_1.createProduct);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.productValidation, products_1.updateProduct);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, products_1.deleteProduct);
exports.default = router;
