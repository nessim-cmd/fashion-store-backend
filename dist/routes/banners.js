"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/banners.ts
const express_1 = __importDefault(require("express"));
const banners_1 = require("../controllers/banners");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Public routes
router.get('/', banners_1.getActiveBanners);
// Admin routes
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.bannerValidation, banners_1.createBanner);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.bannerValidation, banners_1.updateBanner);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, banners_1.deleteBanner);
exports.default = router;
