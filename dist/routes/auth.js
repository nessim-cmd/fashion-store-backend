"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Register a new user
router.post('/register', validate_1.registerValidation, auth_1.register);
// Login user
router.post('/login', validate_1.loginValidation, auth_1.login);
// Get current user (protected route)
router.get('/me', auth_2.authenticate, auth_1.getCurrentUser);
// Logout user (client-side only, just for API completeness)
router.post('/logout', auth_1.logout);
exports.default = router;
