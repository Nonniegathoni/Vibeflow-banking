"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskScore = calculateRiskScore;
exports.shouldFlagTransaction = shouldFlagTransaction;
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize");
// Calculate risk score for a transaction
async function calculateRiskScore(transaction, user) {
    // Initialize risk factors
    const riskFactors = {
        amount: 0,
        frequency: 0,
        location: 0,
        pattern: 0,
        userHistory: 0,
    };
    // 1. Amount factor - higher amounts have higher risk
    if (transaction.amount > 50000) {
        riskFactors.amount = 30;
    }
    else if (transaction.amount > 10000) {
        riskFactors.amount = 15;
    }
    else if (transaction.amount > 5000) {
        riskFactors.amount = 5;
    }
    // 2. Frequency factor - check for multiple transactions in short time
    const recentTransactionsResult = await database_1.default.query(`SELECT COUNT(*) FROM transactions 
     WHERE user_id = :userId AND created_at > NOW() - INTERVAL '24 hours'`, {
        type: sequelize_1.QueryTypes.SELECT,
    });
    const recentTransactionsCount = Number.parseInt(recentTransactionsResult[0].count);
    if (recentTransactionsCount > 10) {
        riskFactors.frequency = 25;
    }
    else if (recentTransactionsCount > 5) {
        riskFactors.frequency = 10;
    }
    // 3. Pattern factor - unusual transaction patterns
    const userAvgAmount = await calculateUserAverageAmount(user.id);
    if (transaction.amount > userAvgAmount * 3) {
        riskFactors.pattern = 20;
    }
    else if (transaction.amount > userAvgAmount * 2) {
        riskFactors.pattern = 10;
    }
    // 4. User history factor - new accounts are higher risk
    const userAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24); // in days
    if (userAge < 7) {
        riskFactors.userHistory = 15;
    }
    else if (userAge < 30) {
        riskFactors.userHistory = 5;
    }
    // Calculate total risk score (max 100)
    const totalRiskScore = Math.min(100, riskFactors.amount + riskFactors.frequency + riskFactors.location + riskFactors.pattern + riskFactors.userHistory);
    return Math.round(totalRiskScore);
}
// Helper function to calculate user's average transaction amount
async function calculateUserAverageAmount(userId) {
    var _a;
    const result = await database_1.default.query("SELECT AVG(amount) as avg_amount FROM transactions WHERE user_id = $1", {
        replacements: [userId],
        type: sequelize_1.QueryTypes.SELECT,
    });
    const avgAmount = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.avg_amount;
    if (avgAmount === undefined || avgAmount === null) {
        return 0;
    }
    return Number(avgAmount);
}
// Determine if a transaction should be flagged based on risk score
function shouldFlagTransaction(riskScore) {
    return riskScore >= 75;
}
