"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const bcrypt_1 = require("bcrypt");
const database_1 = __importDefault(require("../config/database"));
const sequelize_1 = require("sequelize");
const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        const results = await database_1.default.query(
        // Ensure SELECT list ("password") matches interface property name
        'SELECT id, email, "password", role FROM users WHERE email = $1 LIMIT 1', {
            replacements: [email],
            type: sequelize_1.QueryTypes.SELECT
        });
        if (results.length === 0) {
            res.status(401).json({ message: 'Invalid credentials - user not found' });
            return;
        }
        // Explicit Type Assertion: Tell TS that results[0] is a single object
        //@ts-ignore
        const adminUser = results[0];
        // Now perform checks on the typed 'adminUser' object
        if (adminUser.role !== 'admin') {
            res.status(403).json({ message: 'Access denied: User is not an administrator' });
            return;
        }
        // Check if password hash exists (important if password column can be null)
        if (!adminUser.password) {
            console.error(`Admin user ${email} found but missing password hash in result object.`);
            // Status 500 suggests a server/data setup issue rather than bad user input
            res.status(500).json({ message: 'Authentication configuration error.' });
            return;
        }
        // Compare password with the hash from the object
        const isMatch = await (0, bcrypt_1.compare)(password, adminUser.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials - password mismatch' });
            return;
        }
        res.status(200).json({ message: 'Admin credential check successful (implement token/session)' });
    }
    catch (error) {
        console.error('Admin login error:', error);
        next(error || new Error('Server error during admin authentication'));
    }
};
exports.adminLogin = adminLogin;
