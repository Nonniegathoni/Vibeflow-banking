import { Model, DataTypes } from "sequelize"
import db from "../config/database"

class FraudRule extends Model {
  public id!: number
  public name!: string
  public description!: string
  public ruleType!: string
  public threshold!: number | null
  public isActive!: boolean
  public createdBy!: number | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

FraudRule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ruleType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize: db,
    tableName: "fraud_rules",
    timestamps: true,
  }
)

export default FraudRule 