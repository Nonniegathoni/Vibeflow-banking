"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize"); // Import Op separately
const User_1 = __importDefault(require("../models/User"));
const Transaction_1 = __importDefault(require("../models/Transaction")); // Assuming you have this model
const router = (0, express_1.Router)();
// Dashboard statistics
router.get("/dashboard", auth_1.auth, async (req, res, next) => {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        // Get total users using Sequelize count method
        const totalUsers = await User_1.default.count();
        // Get active users (logged in within the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers = await User_1.default.count({
            where: {
                last_login: {
                    [sequelize_1.Op.gte]: sevenDaysAgo // Use Op instead of sequelize.Op
                }
            }
        });
        // Get total transactions using raw query with Sequelize
        const [transactionsResult] = await database_1.default.query("SELECT COUNT(*) as count FROM transactions", { type: sequelize_1.QueryTypes.SELECT });
        // Use type assertion to help TypeScript understand the structure
        const totalTransactions = parseInt(transactionsResult.count);
        // Get total transaction volume
        const [volumeResult] = await database_1.default.query("SELECT SUM(amount) as total FROM transactions", { type: sequelize_1.QueryTypes.SELECT });
        const transactionVolume = parseFloat(volumeResult.total) || 0;
        // Get recent transactions
        const recentTransactions = await Transaction_1.default.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User_1.default,
                    as: 'sender',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User_1.default,
                    as: 'recipient',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        res.json({
            totalUsers,
            activeUsers,
            totalTransactions,
            transactionVolume,
            recentTransactions
        });
    }
    catch (error) {
        console.error("Admin dashboard error:", error);
        next(error);
    }
});
// Rest of your router code...
exports.default = router;
