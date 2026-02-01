"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// Generate JWT token
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
    };
    const secret = env_1.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    // Fallback: Use a hardcoded numeric value (30 days in seconds) for expiresIn
    // 30 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute
    const expiresInSeconds = 30 * 24 * 60 * 60;
    // Explicitly define options type
    const options = {
        expiresIn: expiresInSeconds // Use the hardcoded number of seconds
    };
    // Ensure secret is treated as Secret type expected by jwt.sign
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
// Verify JWT token (keep previous fix)
const verifyToken = (token) => {
    try {
        const secret = env_1.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
