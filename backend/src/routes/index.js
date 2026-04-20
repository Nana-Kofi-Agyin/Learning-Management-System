const express = require("express");
const { dbOps } = require("../config/db");
const authRoutes = require("./auth");
const courseRoutes = require("./courses");
const moduleRoutes = require("./modules");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "InfiLearn LMS backend is running"
  });
});

router.get("/health", async (req, res, next) => {
  try {
    const serverTime = await dbOps.ping();

    res.json({
      success: true,
      status: "ok",
      dbTime: serverTime
    });
  } catch (err) {
    next(err);
  }
});

router.get("/readiness", async (req, res, next) => {
  try {
    const dbTime = await dbOps.ping();
    const { tables, missingTables } = await dbOps.getReadinessChecks();

    res.json({
      success: true,
      status: missingTables.length ? "degraded" : "ready",
      dbTime,
      checks: {
        database: true,
        tables,
        missingTables
      }
    });
  } catch (err) {
    next(err);
  }
});

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/modules", moduleRoutes);

module.exports = router;
