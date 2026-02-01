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
exports.deleteSpecialOffer = exports.updateSpecialOffer = exports.createSpecialOffer = exports.getActiveSpecialOffers = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
// Get all active special offers
const getActiveSpecialOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const specialOffers = yield db_1.default.specialOffer.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(specialOffers);
    }
    catch (error) {
        console.error('Get active special offers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getActiveSpecialOffers = getActiveSpecialOffers;
// Create special offer (admin only)
const createSpecialOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { value, title, description, buttonText, linkUrl, isActive } = req.body;
        // Create special offer
        const specialOffer = yield db_1.default.specialOffer.create({
            data: {
                value,
                title,
                description,
                buttonText,
                linkUrl,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        res.status(201).json(specialOffer);
    }
    catch (error) {
        console.error('Create special offer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createSpecialOffer = createSpecialOffer;
// Update special offer (admin only)
const updateSpecialOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { value, title, description, buttonText, linkUrl, isActive } = req.body;
        // Check if special offer exists
        const existingSpecialOffer = yield db_1.default.specialOffer.findUnique({
            where: { id }
        });
        if (!existingSpecialOffer) {
            return res.status(404).json({ message: 'Special offer not found' });
        }
        // Update special offer
        const specialOffer = yield db_1.default.specialOffer.update({
            where: { id },
            data: {
                value,
                title,
                description,
                buttonText,
                linkUrl,
                isActive
            }
        });
        res.json(specialOffer);
    }
    catch (error) {
        console.error('Update special offer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateSpecialOffer = updateSpecialOffer;
// Delete special offer (admin only)
const deleteSpecialOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if special offer exists
        const existingSpecialOffer = yield db_1.default.specialOffer.findUnique({
            where: { id }
        });
        if (!existingSpecialOffer) {
            return res.status(404).json({ message: 'Special offer not found' });
        }
        // Delete special offer
        yield db_1.default.specialOffer.delete({
            where: { id }
        });
        res.json({ message: 'Special offer deleted successfully' });
    }
    catch (error) {
        console.error('Delete special offer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteSpecialOffer = deleteSpecialOffer;
