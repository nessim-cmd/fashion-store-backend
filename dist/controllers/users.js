"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.updatePassword = exports.updateProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const express_validator_1 = require("express-validator");
const password_1 = require("../utils/password");
// Get all users (admin only)
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { page = 1, limit = 10, search } = req.query;
        // Build filter
        const filter = {};
        if (search) {
            filter.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get users
        const users = yield db_1.default.user.findMany({
            where: filter,
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        orders: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit)
        });
        // Get total count for pagination
        const total = yield db_1.default.user.count({ where: filter });
        // Format response
        const formattedUsers = users.map(user => (Object.assign(Object.assign({}, user), { orderCount: user._count.orders })));
        res.json({
            users: formattedUsers,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUsers = getUsers;
// Get user by ID (admin only)
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { id } = req.params;
        const user = yield db_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true,
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                _count: {
                    select: {
                        orders: true,
                        wishlistItems: true,
                        cartItems: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Format response
        const formattedUser = Object.assign(Object.assign({}, user), { orderCount: user._count.orders, wishlistCount: user._count.wishlistItems, cartCount: user._count.cartItems });
        res.json(formattedUser);
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserById = getUserById;
// Update user (admin only)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { id } = req.params;
        const { name, email, isAdmin: setAdmin, password } = req.body;
        // Check if user exists
        const existingUser = yield db_1.default.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if email is already used by another user
        if (email !== existingUser.email) {
            const emailExists = yield db_1.default.user.findUnique({
                where: { email }
            });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        // Prepare update data
        const updateData = {
            name,
            email,
            isAdmin: setAdmin
        };
        // Hash password if provided
        if (password) {
            updateData.password = yield (0, password_1.hashPassword)(password);
        }
        // Update user
        const user = yield db_1.default.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUser = updateUser;
// Delete user (admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const isAdmin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const { id } = req.params;
        // Check if user exists
        const existingUser = yield db_1.default.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Prevent deleting self
        if (id === ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        // Delete user
        yield db_1.default.user.delete({
            where: { id }
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUser = deleteUser;
// Update own profile (authenticated user)
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name is required' });
        }
        // Update user
        const user = yield db_1.default.user.update({
            where: { id: userId },
            data: { name: name.trim() },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateProfile = updateProfile;
// Update own password (authenticated user)
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        // Get user with password
        const user = yield db_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        const { comparePassword } = yield Promise.resolve().then(() => __importStar(require('../utils/password')));
        const isMatch = yield comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Hash new password and update
        const hashedPassword = yield (0, password_1.hashPassword)(newPassword);
        yield db_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updatePassword = updatePassword;
