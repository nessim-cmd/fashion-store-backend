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
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getActiveBanners = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get all active banners
const getActiveBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield db_1.default.banner.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(banners);
    }
    catch (error) {
        console.error('Get active banners error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getActiveBanners = getActiveBanners;
// Create banner (admin only)
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, subtitle, imageUrl, linkUrl, isActive } = req.body;
        // Create banner
        const banner = yield db_1.default.banner.create({
            data: {
                title,
                subtitle,
                imageUrl,
                linkUrl,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        res.status(201).json(banner);
    }
    catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createBanner = createBanner;
// Update banner (admin only)
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { title, subtitle, imageUrl, linkUrl, isActive } = req.body;
        // Check if banner exists
        const existingBanner = yield db_1.default.banner.findUnique({
            where: { id }
        });
        if (!existingBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        // Update banner
        const banner = yield db_1.default.banner.update({
            where: { id },
            data: {
                title,
                subtitle,
                imageUrl,
                linkUrl,
                isActive
            }
        });
        res.json(banner);
    }
    catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateBanner = updateBanner;
// Delete banner (admin only)
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if banner exists
        const existingBanner = yield db_1.default.banner.findUnique({
            where: { id }
        });
        if (!existingBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        // Delete banner
        yield db_1.default.banner.delete({
            where: { id }
        });
        res.json({ message: 'Banner deleted successfully' });
    }
    catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteBanner = deleteBanner;
