"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/wishlist.ts
const express_1 = __importDefault(require("express"));
const wishlist_1 = require("../controllers/wishlist");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// All wishlist routes are protected
router.get('/', auth_1.authenticate, wishlist_1.getWishlist);
router.post('/', auth_1.authenticate, validate_1.wishlistItemValidation, wishlist_1.addToWishlist);
router.delete('/:productId', auth_1.authenticate, wishlist_1.removeFromWishlist);
router.delete('/', auth_1.authenticate, wishlist_1.clearWishlist);
exports.default = router;
