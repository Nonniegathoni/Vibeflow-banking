"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createServerError = exports.createNotFoundError = exports.createAuthorizationError = exports.createAuthenticationError = exports.createValidationError = exports.createError = exports.ERROR_TYPES = void 0;
// Error types
var ERROR_TYPES;
(function (ERROR_TYPES) {
    ERROR_TYPES["VALIDATION"] = "VALIDATION_ERROR";
    ERROR_TYPES["AUTHENTICATION"] = "AUTHENTICATION_ERROR";
    ERROR_TYPES["AUTHORIZATION"] = "AUTHORIZATION_ERROR";
    ERROR_TYPES["NOT_FOUND"] = "NOT_FOUND";
    ERROR_TYPES["SERVER"] = "SERVER_ERROR";
    ERROR_TYPES["NETWORK"] = "NETWORK_ERROR";
    ERROR_TYPES["UNKNOWN"] = "UNKNOWN_ERROR";
})(ERROR_TYPES || (exports.ERROR_TYPES = ERROR_TYPES = {}));
// Create custom error
const createError = (message, statusCode = 500, type = ERROR_TYPES.UNKNOWN, details = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.type = type;
    error.details = details;
    return error;
};
exports.createError = createError;
// Helper functions to create specific error types
const createValidationError = (message, details) => {
    return (0, exports.createError)(message, 400, ERROR_TYPES.VALIDATION, details);
};
exports.createValidationError = createValidationError;
const createAuthenticationError = (message = "Authentication required") => {
    return (0, exports.createError)(message, 401, ERROR_TYPES.AUTHENTICATION);
};
exports.createAuthenticationError = createAuthenticationError;
const createAuthorizationError = (message = "You do not have permission to perform this action") => {
    return (0, exports.createError)(message, 403, ERROR_TYPES.AUTHORIZATION);
};
exports.createAuthorizationError = createAuthorizationError;
const createNotFoundError = (resource) => {
    return (0, exports.createError)(`${resource} not found`, 404, ERROR_TYPES.NOT_FOUND);
};
exports.createNotFoundError = createNotFoundError;
const createServerError = (message = "Internal server error", details) => {
    return (0, exports.createError)(message, 500, ERROR_TYPES.SERVER, details);
};
exports.createServerError = createServerError;
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    // Default error values
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const type = err.type || ERROR_TYPES.UNKNOWN;
    const details = err.details || null;
    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        type,
        details,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
