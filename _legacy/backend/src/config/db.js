const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongo.uri, {
    dbName: env.mongo.dbName
  });

  return mongoose.connection;
}

const REQUIRED_COLLECTIONS = ["users", "courses", "modules", "lessons", "quizzes", "enrollments"];

const dbOps = {
  async ping() {
    await connectDb();
    await mongoose.connection.db.admin().ping();
    return new Date().toISOString();
  },

  async getReadinessChecks() {
    await connectDb();

    const collections = await mongoose.connection.db.listCollections().toArray();
    const existing = new Set(collections.map((entry) => entry.name));

    const tables = Object.fromEntries(
      REQUIRED_COLLECTIONS.map((name) => [name, existing.has(name)])
    );

    const missingTables = REQUIRED_COLLECTIONS.filter((name) => !existing.has(name));

    return {
      tables,
      missingTables
    };
  }
};

async function checkDbConnection() {
  await dbOps.ping();
}

async function closeDbConnection() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDb,
  checkDbConnection,
  closeDbConnection,
  dbOps
};
