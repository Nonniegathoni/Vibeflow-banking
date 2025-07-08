require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const User = sequelize.define("User", {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});

const Transaction = sequelize.define("Transaction", {
  userId: DataTypes.INTEGER,
  amount: DataTypes.FLOAT,
  type: DataTypes.STRING,
  recipient: DataTypes.STRING,
});

const FraudAlert = sequelize.define("FraudAlert", {
  userId: DataTypes.INTEGER,
  transactionId: DataTypes.INTEGER,
  reason: DataTypes.STRING,
  isResolved: DataTypes.BOOLEAN,
});

async function setup() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    await sequelize.sync({ force: true }); // Use with caution in prod
    console.log("✅ Tables created successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  }
}

setup();
