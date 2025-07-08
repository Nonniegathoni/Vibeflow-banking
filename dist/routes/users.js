"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User")); // Import the User model
const router = (0, express_1.Router)();
// Get user profile
router.get("/profile", auth_1.auth, async (req, res, next) => {
    var _a;
    try {
        // Now TypeScript knows that req.user exists because of our type declaration
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Use Sequelize model to find the user
        const user = await User_1.default.findByPk(userId, {
            attributes: ['id', 'email', 'name', 'phone_number', 'role', 'account_number', 'balance', 'createdAt']
            // Exclude password and other sensitive fields
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
});
// Get all users (admin only)
router.get("/", auth_1.auth, async (req, res, next) => {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        // Use Sequelize model to find all users
        const users = await User_1.default.findAll({
            attributes: ['id', 'email', 'name', 'phone_number', 'role', 'account_number', 'balance', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json({ users });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
