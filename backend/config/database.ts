import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD as string;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

if (!dbName || !dbUser || !dbPassword || !dbHost) {
  console.error(
    "FATAL ERROR: Database configuration environment variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST) are missing!"
  );
  throw new Error(
    "Missing essential database configuration in environment variables."
  );
}

const useSSL = dbHost?.includes("render.com");

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
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
  } catch (error) {
    console.error("Unable to connect to the database via Sequelize:", error);
    setTimeout(testConnection, 5000);
  }
}

testConnection();

setInterval(testConnection, 300000);

export default sequelize;
