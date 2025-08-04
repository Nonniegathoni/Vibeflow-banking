"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = void 0;
// models/associations.ts
const User_1 = __importDefault(require("./User"));
const Transaction_1 = __importDefault(require("./Transaction"));
// Set up associations between models
const setupAssociations = () => {
    // User associations
    User_1.default.hasMany(Transaction_1.default, { foreignKey: 'sender_id', as: 'sentTransactions' });
    User_1.default.hasMany(Transaction_1.default, { foreignKey: 'recipient_id', as: 'receivedTransactions' });
    // Transaction associations
    Transaction_1.default.belongsTo(User_1.default, { foreignKey: 'sender_id', as: 'sender' });
    Transaction_1.default.belongsTo(User_1.default, { foreignKey: 'recipient_id', as: 'recipient' });
};
exports.setupAssociations = setupAssociations;
