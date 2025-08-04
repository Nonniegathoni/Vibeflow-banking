"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
if (!dbName || !dbUser || !dbPassword || !dbHost) {
    console.error("FATAL ERROR: Database configuration environment variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST) are missing!");
    throw new Error("Missing essential database configuration in environment variables.");
}
const useSSL = dbHost === null || dbHost === void 0 ? void 0 : dbHost.includes("render.com");
const sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 30000,
        evict: 10000,
    },
    retry: {
        max: 5,
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /SequelizeConnectionAcquireTimeoutError/,
        ],
    },
    dialectOptions: useSSL
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
            keepAlive: true,
            connectionTimeoutMillis: 60000,
        }
        : {
            keepAlive: true,
            connectionTimeoutMillis: 60000,
        },
});
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connection has been established successfully.");
    }
    catch (error) {
        console.error("Unable to connect to the database via Sequelize:", error);
        setTimeout(testConnection, 5000);
    }
}
testConnection();
setInterval(testConnection, 300000);
exports.default = sequelize;
