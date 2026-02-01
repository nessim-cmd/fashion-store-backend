"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/orders.ts
const express_1 = __importDefault(require("express"));
const orders_1 = require("../controllers/orders");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// User routes (protected)
router.get('/', auth_1.authenticate, orders_1.getUserOrders);
router.get('/:id', auth_1.authenticate, orders_1.getOrderById);
router.post('/', auth_1.authenticate, validate_1.orderValidation, orders_1.createOrder);
// Admin routes
router.put('/:id/status', auth_1.authenticate, auth_1.authorizeAdmin, orders_1.updateOrderStatus);
router.get('/admin/all', auth_1.authenticate, auth_1.authorizeAdmin, orders_1.getAllOrders);
exports.default = router;
