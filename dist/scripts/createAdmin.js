"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const createAdmin = async () => {
    try {
        console.log("Checking if admin user exists...");
        const adminEmail = "admin@vibeflow.com";
        const existingAdmins = await database_1.default.query("SELECT id FROM users WHERE email = $1 LIMIT 1", {
            replacements: [adminEmail],
            type: sequelize_1.QueryTypes.SELECT
        });
        if (existingAdmins.length > 0) {
            console.log(`Admin user with email ${adminEmail} already exists.`);
            process.exit(0);
        }
        console.log("Creating admin user...");
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash("Admin123!", salt);
        const adminName = "Admin User";
        const adminPhone = "+254712345678";
        const adminRole = "admin";
        const adminAccount = "9999999999";
        const adminBalance = 1000000.00;
        // Use QueryTypes.SELECT because RETURNING makes the query return rows
        const results = await database_1.default.query(`INSERT INTO users
       (name, email, "password", phone_number, role, account_number, balance, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role`, {
            replacements: [adminName, adminEmail, hashedPassword, adminPhone, adminRole, adminAccount, adminBalance],
            type: sequelize_1.QueryTypes.SELECT
        });
        if (results && results.length > 0 && results[0]) {
            console.log("Admin user created:", results[0]);
        }
        else {
            console.warn("Admin user inserted, but no data was returned.");
        }
        process.exit(0);
    }
    catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
};
createAdmin();
