"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/coupons.ts
const express_1 = __importDefault(require("express"));
const coupons_1 = require("../controllers/coupons");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Public routes
router.get('/', coupons_1.getActiveCoupons);
router.get('/validate/:code', coupons_1.validateCoupon);
// Admin routes
router.get('/admin/all', auth_1.authenticate, auth_1.authorizeAdmin, coupons_1.getAllCoupons);
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.couponValidation, coupons_1.createCoupon);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.couponValidation, coupons_1.updateCoupon);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, coupons_1.deleteCoupon);
exports.default = router;
