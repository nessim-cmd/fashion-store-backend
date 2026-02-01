"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/cart.ts
const express_1 = __importDefault(require("express"));
const cart_1 = require("../controllers/cart");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// All cart routes are protected
router.get('/', auth_1.authenticate, cart_1.getCart);
router.post('/', auth_1.authenticate, validate_1.cartItemValidation, cart_1.addToCart);
router.put('/:itemId', auth_1.authenticate, cart_1.updateCartItem);
router.delete('/:itemId', auth_1.authenticate, cart_1.removeFromCart);
router.delete('/', auth_1.authenticate, cart_1.clearCart);
exports.default = router;
