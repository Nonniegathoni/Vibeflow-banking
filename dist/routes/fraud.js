"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const adminAuth_1 = __importDefault(require("../middleware/adminAuth"));
const error_handler_1 = require("../middleware/error-handler");
const database_1 = __importDefault(require("../config/database")); // Assuming 'db' is the exported Sequelize instance
const sequelize_1 = require("sequelize"); // Import QueryTypes
const router = express_1.default.Router();
// Get fraud alerts for current user
router.get("/alerts", auth_1.auth, async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            // Should ideally be caught by 'auth' middleware, but good to double-check
            res.status(401).json({ success: false, message: "User not authenticated" });
            return;
        }
        const results = await database_1.default.query(`SELECT fa.*, t.type as transaction_type, t.amount as transaction_amount
       FROM fraud_alerts fa
       JOIN transactions t ON fa.transaction_id = t.id
       WHERE fa.user_id = $1
       ORDER BY fa.created_at DESC`, {
            replacements: [req.user.id],
            type: sequelize_1.QueryTypes.SELECT
        });
        res.status(200).json({
            success: true,
            count: results.length, // Use length of the result array
            alerts: results, // Result is the array directly
        });
    }
    catch (error) {
        console.error("Error fetching user fraud alerts:", error);
        next(error);
    }
});
// Get fraud alert by ID
router.get("/alerts/:id", auth_1.auth, async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ success: false, message: "User not authenticated" });
            return;
        }
        const results = await database_1.default.query(`SELECT fa.*, t.type as transaction_type, t.amount as transaction_amount
       FROM fraud_alerts fa
       JOIN transactions t ON fa.transaction_id = t.id
       WHERE fa.id = $1 AND fa.user_id = $2`, {
            replacements: [id, req.user.id],
            type: sequelize_1.QueryTypes.SELECT
        });
        if (results.length === 0) {
            // Use return after sending response or calling next
            return next((0, error_handler_1.createNotFoundError)("Fraud alert"));
        }
        res.status(200).json({
            success: true,
            alert: results[0], // Get the first element from the result array
        });
    }
    catch (error) {
        console.error("Error fetching fraud alert by ID:", error);
        next(error);
    }
});
// Admin routes for fraud management
router.get("/admin/alerts", adminAuth_1.default, async (req, res, next) => {
    var _a;
    try {
        const page = Number.parseInt(req.query.page || '1', 10) || 1;
        const limit = Number.parseInt(req.query.limit || '10', 10) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        let baseQuery = `
      FROM fraud_alerts fa
      JOIN users u ON fa.user_id = u.id
      JOIN transactions t ON fa.transaction_id = t.id
    `;
        const replacements = [];
        let whereClause = "";
        if (status) {
            whereClause = " WHERE fa.status = $1";
            replacements.push(status);
        }
        // Count total
        const countQuery = `SELECT COUNT(*) as count ${baseQuery} ${whereClause}`;
        const [countResult] = await database_1.default.query(countQuery, {
            replacements: replacements, // Use same replacements for count
            type: sequelize_1.QueryTypes.SELECT
        });
        const total = Number.parseInt(String((_a = countResult === null || countResult === void 0 ? void 0 : countResult.count) !== null && _a !== void 0 ? _a : 0));
        // Build SELECT query
        let selectQuery = `
      SELECT fa.*,
             u.name as user_name, u.email as user_email,
             t.type as transaction_type, t.amount as transaction_amount
      ${baseQuery}
      ${whereClause}
      ORDER BY fa.created_at DESC
      LIMIT $${replacements.length + 1} OFFSET $${replacements.length + 2}
    `;
        const queryParams = [...replacements, limit, offset]; // Add limit and offset to params
        const results = await database_1.default.query(selectQuery, {
            replacements: queryParams,
            type: sequelize_1.QueryTypes.SELECT
        });
        res.status(200).json({
            success: true,
            count: results.length, // Length of current page results
            total, // Total count from count query
            page,
            pages: Math.ceil(total / limit),
            alerts: results, // Paginated results array
        });
    }
    catch (error) {
        console.error("Error fetching admin fraud alerts:", error);
        next(error);
    }
});
// Update fraud alert status (admin only)
router.put("/admin/alerts/:id", adminAuth_1.default, async (req, res, next) => {
    var _a;
    try {
        const { id } = req.params;
        const { status, resolution } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ success: false, message: "Admin user not authenticated" });
            return;
        }
        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required",
            });
            return;
        }
        const results = await database_1.default.query(`UPDATE fraud_alerts
       SET status = $1, resolution = $2, resolved_by = $3, resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = $4
       RETURNING *`, {
            replacements: [status, resolution || null, req.user.id, id],
            type: sequelize_1.QueryTypes.SELECT // Using SELECT because RETURNING * returns rows
        });
        if (results.length === 0) {
            return next((0, error_handler_1.createNotFoundError)("Fraud alert"));
        }
        res.status(200).json({
            success: true,
            message: "Fraud alert updated successfully",
            alert: results[0], // Get the first (and only expected) returned row
        });
    }
    catch (error) {
        console.error("Error updating fraud alert:", error);
        next(error);
    }
});
exports.default = router;
