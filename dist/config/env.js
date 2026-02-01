"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Environment variables
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    DATABASE_URL: process.env.DATABASE_URL || ''
};
