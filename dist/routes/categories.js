"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/categories.ts
const express_1 = __importDefault(require("express"));
const categories_1 = require("../controllers/categories");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Public routes
router.get('/', categories_1.getCategories);
router.get('/slug/:slug', categories_1.getCategoryBySlug);
// Subcategory routes (before /:id to avoid conflicts)
router.get('/subcategories', categories_1.getSubcategories);
router.post('/subcategories', auth_1.authenticate, auth_1.authorizeAdmin, categories_1.createSubcategory);
router.put('/subcategories/:id', auth_1.authenticate, auth_1.authorizeAdmin, categories_1.updateSubcategory);
router.delete('/subcategories/:id', auth_1.authenticate, auth_1.authorizeAdmin, categories_1.deleteSubcategory);
// Category by ID (after subcategories to avoid route conflict)
router.get('/:id', categories_1.getCategoryById);
// Protected admin routes
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.categoryValidation, categories_1.createCategory);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.categoryValidation, categories_1.updateCategory);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, categories_1.deleteCategory);
exports.default = router;
