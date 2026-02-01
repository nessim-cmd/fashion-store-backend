"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authorizeAdmin = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
// Authentication middleware
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            isAdmin: decoded.isAdmin
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
// Alias for authorizeAdmin
exports.isAdmin = exports.authorizeAdmin;
