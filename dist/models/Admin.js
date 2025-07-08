"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../config/database"));
class Admin extends sequelize_1.Model {
    // Method to compare password
    async comparePassword(candidatePassword) {
        return bcrypt_1.default.compare(candidatePassword, this.password);
    }
}
Admin.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "admin",
    },
}, {
    sequelize: database_1.default,
    modelName: 'Admin',
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.password) {
                const salt = await bcrypt_1.default.genSalt(10);
                admin.password = await bcrypt_1.default.hash(admin.password, salt);
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('password')) {
                const salt = await bcrypt_1.default.genSalt(10);
                admin.password = await bcrypt_1.default.hash(admin.password, salt);
            }
        },
    },
});
exports.default = Admin;
