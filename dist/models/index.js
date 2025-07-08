"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Transaction_1 = __importDefault(require("./Transaction"));
exports.Transaction = Transaction_1.default;
// Define associations
User_1.default.hasMany(Transaction_1.default, {
    foreignKey: "userId",
    as: "transactions",
});
Transaction_1.default.belongsTo(User_1.default, {
    foreignKey: "userId",
    as: "user",
});
