"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/users.ts
const express_1 = __importDefault(require("express"));
const users_1 = require("../controllers/users");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
// Self-update routes (authenticated users)
router.put('/profile', auth_1.authenticate, users_1.updateProfile);
router.put('/password', auth_1.authenticate, users_1.updatePassword);
// Admin-only routes
router.get('/', auth_1.authenticate, auth_1.authorizeAdmin, users_1.getUsers);
router.get('/:id', auth_1.authenticate, auth_1.authorizeAdmin, users_1.getUserById);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, validate_1.userUpdateValidation, users_1.updateUser);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, users_1.deleteUser);
exports.default = router;
