"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Generate JWT token
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET || "your_jwt_secret_key_here", {
        expiresIn: "7d",
    });
}
// Verify JWT token
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here");
}
