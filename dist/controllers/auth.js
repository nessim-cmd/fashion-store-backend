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
exports.logout = exports.getCurrentUser = exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../config/db"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const express_validator_1 = require("express-validator");
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield db_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        // Create user
        const user = yield db_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isAdmin: false
            }
        });
        // Generate token
        const token = (0, jwt_1.generateToken)(user);
        // Return user data (excluding password)
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Find user
        const user = yield db_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ message: 'No account found with this email address' });
        }
        // Check password
        const isPasswordValid = yield (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password. Please try again' });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)(user);
        // Return user data (excluding password) nested under 'user' key
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
// Get current user
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User is attached to request by auth middleware
        const userId = req.user.id;
        const user = yield db_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user data (excluding password)
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCurrentUser = getCurrentUser;
// Logout user (client-side only, just for API completeness)
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: 'Logout successful' });
});
exports.logout = logout;
