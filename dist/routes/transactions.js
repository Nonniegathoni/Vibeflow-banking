"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
// Define allowed sort columns and map them to actual database columns if needed
const allowedSortColumns = {
    date: '"createdAt"',
    amount: 'amount'
};
// Get transactions for a user
router.get("/", auth_1.auth, async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // Get query parameters and validate/sanitize them
        const queryLimit = parseInt(req.query.limit || '10', 10);
        const queryOffset = parseInt(req.query.offset || '0', 10);
        const sortInput = req.query.sort || 'date';
        const orderInput = req.query.order || 'desc';
        const limit = Math.max(1, queryLimit); // Ensure limit is at least 1
        const offset = Math.max(0, queryOffset); // Ensure offset is non-negative
        // Validate sort column
        const sortColumn = allowedSortColumns[sortInput.toLowerCase()] || allowedSortColumns.date; // Default to date if invalid
        // Validate order direction
        const order = orderInput.toLowerCase() === 'asc' ? 'ASC' : 'DESC'; // Default to DESC
        const result = await database_1.default.query(`SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY ${sortColumn} ${order}
       LIMIT $2 OFFSET $3`, {
            replacements: [userId, limit, offset],
            type: sequelize_1.QueryTypes.SELECT
        });
        // The result is the array of transactions directly
        res.json({ transactions: result });
    }
    catch (error) {
        console.error("Error fetching transactions:", error); // Log the error for debugging
        next(error);
    }
});
exports.default = router;
