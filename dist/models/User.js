"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
    // Instance method for password comparison
    async comparePassword(candidatePassword) {
        return bcrypt_1.default.compare(candidatePassword, this.password);
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('user', 'admin', 'agent'),
        defaultValue: 'user',
    },
    account_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 5000.00,
    },
    verification_code: {
        type: sequelize_1.DataTypes.STRING(6),
        allowNull: true,
    },
    verification_code_expires_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    last_login: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            // Hash password before saving
            if (user.password) {
                const salt = await bcrypt_1.default.genSalt(10);
                user.password = await bcrypt_1.default.hash(user.password, salt);
            }
            // Generate account number if not provided
            if (!user.account_number) {
                // Generate a 10-digit account number
                user.account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            }
        },
        beforeUpdate: async (user) => {
            // Hash password on update if changed
            if (user.changed('password')) {
                const salt = await bcrypt_1.default.genSalt(10);
                user.password = await bcrypt_1.default.hash(user.password, salt);
            }
        },
    },
});
exports.default = User;
