import { Model, DataTypes } from "sequelize"
import db from "../config/database"

class CustomerSupport extends Model {
  public id!: number
  public userId!: number
  public subject!: string
  public message!: string
  public status!: string
  public assignedTo!: number | null
  public readonly createdAt!: Date
  public resolvedAt!: Date | null
  public readonly updatedAt!: Date
}

CustomerSupport.init(
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
        model: "users",
        key: "id",
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "open",
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "customer_support",
    timestamps: true,
  }
)

export default CustomerSupport 