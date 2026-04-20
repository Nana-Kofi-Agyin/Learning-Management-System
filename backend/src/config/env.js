const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["MONGO_URI"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.warn(`Missing environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/infilearn",
    dbName: process.env.MONGO_DB_NAME || "infilearn"
  }
};
