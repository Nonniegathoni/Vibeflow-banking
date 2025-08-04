import { Model, DataTypes } from "sequelize"
import db from "../config/database"

class Notification extends Model {
  public id!: number
  public userId!: number
  public type!: string
  public message!: string
  public isRead!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Notification.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: "notifications",
    timestamps: true,
  }
)

export default Notification 