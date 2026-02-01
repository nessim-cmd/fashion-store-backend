"use strict";
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
exports.deleteSubcategory = exports.updateSubcategory = exports.createSubcategory = exports.getSubcategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getCategories = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get all categories
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield db_1.default.category.findMany({
            include: {
                subcategories: {
                    include: {
                        subSubcategories: true
                    }
                }
            }
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategories = getCategories;
// Get category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield db_1.default.category.findUnique({
            where: { id },
            include: {
                subcategories: {
                    include: {
                        subSubcategories: true
                    }
                }
            }
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategoryById = getCategoryById;
// Get category by slug
const getCategoryBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const category = yield db_1.default.category.findUnique({
            where: { slug },
            include: {
                subcategories: {
                    include: {
                        subSubcategories: true
                    }
                }
            }
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        console.error('Get category by slug error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategoryBySlug = getCategoryBySlug;
// Create category (admin only)
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description, image, slug } = req.body;
        // Check if slug already exists
        const existingCategory = yield db_1.default.category.findUnique({
            where: { slug }
        });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this slug already exists' });
        }
        // Create category
        const category = yield db_1.default.category.create({
            data: {
                name,
                description,
                image,
                slug
            }
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createCategory = createCategory;
// Update category (admin only)
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { name, description, image, slug } = req.body;
        // Check if category exists
        const existingCategory = yield db_1.default.category.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Check if slug is already used by another category
        if (slug !== existingCategory.slug) {
            const slugExists = yield db_1.default.category.findUnique({
                where: { slug }
            });
            if (slugExists) {
                return res.status(400).json({ message: 'Category with this slug already exists' });
            }
        }
        // Update category
        const category = yield db_1.default.category.update({
            where: { id },
            data: {
                name,
                description,
                image,
                slug
            }
        });
        res.json(category);
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCategory = updateCategory;
// Delete category (admin only)
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if category exists
        const existingCategory = yield db_1.default.category.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Delete category (cascade will handle subcategories)
        yield db_1.default.category.delete({
            where: { id }
        });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteCategory = deleteCategory;
// ============ SUBCATEGORIES ============
// Get all subcategories (optionally by category)
const getSubcategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.query;
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        const subcategories = yield db_1.default.subcategory.findMany({
            where,
            include: {
                category: true,
                subSubcategories: true,
                _count: { select: { products: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(subcategories);
    }
    catch (error) {
        console.error('Get subcategories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSubcategories = getSubcategories;
// Create subcategory
const createSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, slug, categoryId } = req.body;
        // Check if category exists
        const category = yield db_1.default.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Check if slug already exists
        const existing = yield db_1.default.subcategory.findUnique({ where: { slug } });
        if (existing) {
            return res.status(400).json({ message: 'Subcategory with this slug already exists' });
        }
        const subcategory = yield db_1.default.subcategory.create({
            data: { name, description, slug, categoryId },
            include: { category: true }
        });
        res.status(201).json(subcategory);
    }
    catch (error) {
        console.error('Create subcategory error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createSubcategory = createSubcategory;
// Update subcategory
const updateSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, slug, categoryId } = req.body;
        const existing = yield db_1.default.subcategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        // Check slug uniqueness if changed
        if (slug !== existing.slug) {
            const slugExists = yield db_1.default.subcategory.findUnique({ where: { slug } });
            if (slugExists) {
                return res.status(400).json({ message: 'Subcategory with this slug already exists' });
            }
        }
        const subcategory = yield db_1.default.subcategory.update({
            where: { id },
            data: { name, description, slug, categoryId },
            include: { category: true }
        });
        res.json(subcategory);
    }
    catch (error) {
        console.error('Update subcategory error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateSubcategory = updateSubcategory;
// Delete subcategory
const deleteSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const existing = yield db_1.default.subcategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        yield db_1.default.subcategory.delete({ where: { id } });
        res.json({ message: 'Subcategory deleted successfully' });
    }
    catch (error) {
        console.error('Delete subcategory error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteSubcategory = deleteSubcategory;
