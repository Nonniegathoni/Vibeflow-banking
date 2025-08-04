"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiError = exports.createServerError = exports.createNotFoundError = exports.createAuthorizationError = exports.createAuthenticationError = exports.createValidationError = exports.createError = exports.AppError = exports.ErrorType = void 0;
// Error types
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION"] = "VALIDATION_ERROR";
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION_ERROR";
    ErrorType["AUTHORIZATION"] = "AUTHORIZATION_ERROR";
    ErrorType["NOT_FOUND"] = "NOT_FOUND";
    ErrorType["SERVER"] = "SERVER_ERROR";
    ErrorType["NETWORK"] = "NETWORK_ERROR";
    ErrorType["UNKNOWN"] = "UNKNOWN_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// Create custom error class
class AppError extends Error {
    constructor(message, statusCode = 500, type = ErrorType.UNKNOWN, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.type = type;
        this.details = details;
        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
// Helper functions to create specific error types
const createError = (message, statusCode = 500, type = ErrorType.UNKNOWN, details = null) => {
    return new AppError(message, statusCode, type, details);
};
exports.createError = createError;
const createValidationError = (message, details) => {
    return new AppError(message, 400, ErrorType.VALIDATION, details);
};
exports.createValidationError = createValidationError;
const createAuthenticationError = (message = "Authentication required") => {
    return new AppError(message, 401, ErrorType.AUTHENTICATION);
};
exports.createAuthenticationError = createAuthenticationError;
const createAuthorizationError = (message = "You do not have permission to perform this action") => {
    return new AppError(message, 403, ErrorType.AUTHORIZATION);
};
exports.createAuthorizationError = createAuthorizationError;
const createNotFoundError = (resource) => {
    return new AppError(`${resource} not found`, 404, ErrorType.NOT_FOUND);
};
exports.createNotFoundError = createNotFoundError;
const createServerError = (message = "Internal server error", details) => {
    return new AppError(message, 500, ErrorType.SERVER, details);
};
exports.createServerError = createServerError;
// Function to handle errors in API routes
const handleApiError = (error) => {
    console.error("API Error:", error);
    if (error instanceof AppError) {
        return {
            success: false,
            message: error.message,
            type: error.type,
            details: error.details,
            statusCode: error.statusCode,
        };
    }
    // Handle unexpected errors
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
        success: false,
        message,
        type: ErrorType.UNKNOWN,
        statusCode: 500,
    };
};
exports.handleApiError = handleApiError;
