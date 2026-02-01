"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    // Default error message
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
};
exports.errorHandler = errorHandler;
// Not found middleware
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
