"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import models and database connection
const database_1 = __importDefault(require("./config/database"));
require("./models/User"); // Import all models
require("./models/Transaction");
const associations_1 = require("./models/associations");
// Set up model associations
(0, associations_1.setupAssociations)();
// Sync database (be careful with force in production)
const syncDatabase = async () => {
    try {
        await database_1.default.sync({ alter: true });
        console.log('✅ Database synchronized successfully');
    }
    catch (error) {
        console.error('❌ Failed to synchronize database:', error);
    }
};
// Export or call the sync function as needed
exports.default = syncDatabase;
