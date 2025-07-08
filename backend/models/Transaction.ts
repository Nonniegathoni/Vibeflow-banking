import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface TransactionAttributes {
  id: number;
  userId: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

class Transaction extends Model<TransactionAttributes> implements TransactionAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'deposit' | 'withdrawal' | 'transfer';
  public amount!: number;
  public description?: string;
  public status!: 'pending' | 'completed' | 'failed';
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
  }
);

// Define associations
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Transaction;