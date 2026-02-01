"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/specialOffers.ts
const express_1 = __importDefault(require("express"));
const specialOffers_1 = require("../controllers/specialOffers");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Public routes
router.get('/', specialOffers_1.getActiveSpecialOffers);
// Admin routes
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.specialOfferValidation, specialOffers_1.createSpecialOffer);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.specialOfferValidation, specialOffers_1.updateSpecialOffer);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, specialOffers_1.deleteSpecialOffer);
exports.default = router;
