import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Neon database configuration
const dbName = "neondb";
const dbUser = "neondb_owner";
const dbHost = "ep-tiny-snow-a2dpd0fn-pooler.eu-central-1.aws.neon.tech";
const dbPassword = "npg_43VHrdvtDTbK";
const dbPort = 5432;

const useSSL = dbHost?.includes("render.com") || dbHost?.includes("neon.tech");

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
