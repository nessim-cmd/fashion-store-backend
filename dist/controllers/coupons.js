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
exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.validateCoupon = exports.getActiveCoupons = exports.getAllCoupons = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get all coupons (admin only)
const getAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const coupons = yield db_1.default.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(coupons);
    }
    catch (error) {
        console.error('Get all coupons error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllCoupons = getAllCoupons;
// Get all active coupons
const getActiveCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield db_1.default.coupon.findMany({
            where: {
                isActive: true,
                expiresAt: {
                    gt: new Date()
                }
            }
        });
        res.json(coupons);
    }
    catch (error) {
        console.error('Get active coupons error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getActiveCoupons = getActiveCoupons;
// Validate coupon code
const validateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }
        const coupon = yield db_1.default.coupon.findUnique({
            where: { code }
        });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Coupon is inactive' });
        }
        if (new Date(coupon.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }
        res.json(coupon);
    }
    catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.validateCoupon = validateCoupon;
// Create coupon (admin only)
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { code, discount, type, minPurchase, expiresAt, isActive } = req.body;
        // Check if coupon code already exists
        const existingCoupon = yield db_1.default.coupon.findUnique({
            where: { code }
        });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        // Create coupon
        const coupon = yield db_1.default.coupon.create({
            data: {
                code,
                discount: parseFloat(discount),
                type,
                minPurchase: minPurchase ? parseFloat(minPurchase) : null,
                expiresAt: new Date(expiresAt),
                isActive: isActive !== undefined ? isActive : true
            }
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createCoupon = createCoupon;
// Update coupon (admin only)
const updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { code, discount, type, minPurchase, expiresAt, isActive } = req.body;
        // Check if coupon exists
        const existingCoupon = yield db_1.default.coupon.findUnique({
            where: { id }
        });
        if (!existingCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        // Check if code is already used by another coupon
        if (code !== existingCoupon.code) {
            const codeExists = yield db_1.default.coupon.findUnique({
                where: { code }
            });
            if (codeExists) {
                return res.status(400).json({ message: 'Coupon code already exists' });
            }
        }
        // Update coupon
        const coupon = yield db_1.default.coupon.update({
            where: { id },
            data: {
                code,
                discount: parseFloat(discount),
                type,
                minPurchase: minPurchase ? parseFloat(minPurchase) : null,
                expiresAt: new Date(expiresAt),
                isActive
            }
        });
        res.json(coupon);
    }
    catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCoupon = updateCoupon;
// Delete coupon (admin only)
const deleteCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if coupon exists
        const existingCoupon = yield db_1.default.coupon.findUnique({
            where: { id }
        });
        if (!existingCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        // Delete coupon
        yield db_1.default.coupon.delete({
            where: { id }
        });
        res.json({ message: 'Coupon deleted successfully' });
    }
    catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteCoupon = deleteCoupon;
