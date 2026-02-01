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
exports.deleteAttribute = exports.updateAttribute = exports.createAttribute = exports.getAttributes = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get all attributes (sizes and colors)
const getAttributes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get unique sizes
        const productSizes = yield db_1.default.productSize.findMany({
            select: {
                size: true
            },
            distinct: ['size']
        });
        // Get unique colors
        const productColors = yield db_1.default.productColor.findMany({
            select: {
                name: true,
                hex: true
            },
            distinct: ['name', 'hex']
        });
        // Format response
        const sizes = productSizes.map(ps => ps.size);
        const colors = productColors.map(pc => ({
            name: pc.name,
            hex: pc.hex
        }));
        res.json({
            sizes,
            colors
        });
    }
    catch (error) {
        console.error('Get attributes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAttributes = getAttributes;
// Create attribute (admin only)
const createAttribute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { type, value, productId, colorHex } = req.body;
        // Check if product exists
        const product = yield db_1.default.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Create attribute based on type
        if (type === 'size') {
            // Check if size already exists for this product
            const existingSize = yield db_1.default.productSize.findFirst({
                where: {
                    productId,
                    size: value
                }
            });
            if (existingSize) {
                return res.status(400).json({ message: 'Size already exists for this product' });
            }
            // Create size
            const size = yield db_1.default.productSize.create({
                data: {
                    productId,
                    size: value
                }
            });
            res.status(201).json(size);
        }
        else if (type === 'color') {
            // Check if color already exists for this product
            const existingColor = yield db_1.default.productColor.findFirst({
                where: {
                    productId,
                    name: value
                }
            });
            if (existingColor) {
                return res.status(400).json({ message: 'Color already exists for this product' });
            }
            // Create color
            const color = yield db_1.default.productColor.create({
                data: {
                    productId,
                    name: value,
                    hex: colorHex || '#000000'
                }
            });
            res.status(201).json(color);
        }
        else {
            return res.status(400).json({ message: 'Invalid attribute type' });
        }
    }
    catch (error) {
        console.error('Create attribute error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createAttribute = createAttribute;
// Update attribute (admin only)
const updateAttribute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { type, value, colorHex } = req.body;
        // Update attribute based on type
        if (type === 'size') {
            // Check if size exists
            const existingSize = yield db_1.default.productSize.findUnique({
                where: { id }
            });
            if (!existingSize) {
                return res.status(404).json({ message: 'Size not found' });
            }
            // Check if new size already exists for this product
            if (value !== existingSize.size) {
                const sizeExists = yield db_1.default.productSize.findFirst({
                    where: {
                        productId: existingSize.productId,
                        size: value
                    }
                });
                if (sizeExists) {
                    return res.status(400).json({ message: 'Size already exists for this product' });
                }
            }
            // Update size
            const size = yield db_1.default.productSize.update({
                where: { id },
                data: {
                    size: value
                }
            });
            res.json(size);
        }
        else if (type === 'color') {
            // Check if color exists
            const existingColor = yield db_1.default.productColor.findUnique({
                where: { id }
            });
            if (!existingColor) {
                return res.status(404).json({ message: 'Color not found' });
            }
            // Check if new color already exists for this product
            if (value !== existingColor.name) {
                const colorExists = yield db_1.default.productColor.findFirst({
                    where: {
                        productId: existingColor.productId,
                        name: value
                    }
                });
                if (colorExists) {
                    return res.status(400).json({ message: 'Color already exists for this product' });
                }
            }
            // Update color
            const color = yield db_1.default.productColor.update({
                where: { id },
                data: {
                    name: value,
                    hex: colorHex || existingColor.hex
                }
            });
            res.json(color);
        }
        else {
            return res.status(400).json({ message: 'Invalid attribute type' });
        }
    }
    catch (error) {
        console.error('Update attribute error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateAttribute = updateAttribute;
// Delete attribute (admin only)
const deleteAttribute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, type } = req.params;
        // Delete attribute based on type
        if (type === 'size') {
            // Check if size exists
            const existingSize = yield db_1.default.productSize.findUnique({
                where: { id }
            });
            if (!existingSize) {
                return res.status(404).json({ message: 'Size not found' });
            }
            // Delete size
            yield db_1.default.productSize.delete({
                where: { id }
            });
            res.json({ message: 'Size deleted successfully' });
        }
        else if (type === 'color') {
            // Check if color exists
            const existingColor = yield db_1.default.productColor.findUnique({
                where: { id }
            });
            if (!existingColor) {
                return res.status(404).json({ message: 'Color not found' });
            }
            // Delete color
            yield db_1.default.productColor.delete({
                where: { id }
            });
            res.json({ message: 'Color deleted successfully' });
        }
        else {
            return res.status(400).json({ message: 'Invalid attribute type' });
        }
    }
    catch (error) {
        console.error('Delete attribute error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteAttribute = deleteAttribute;
