const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");
const { dbOps } = require("../src/config/db");

const realPing = dbOps.ping;
const realGetReadinessChecks = dbOps.getReadinessChecks;

function mockDbOps({ ping, getReadinessChecks }) {
  if (typeof ping === "function") {
    dbOps.ping = ping;
  }

  if (typeof getReadinessChecks === "function") {
    dbOps.getReadinessChecks = getReadinessChecks;
  }
}

function restoreDbOps() {
  dbOps.ping = realPing;
  dbOps.getReadinessChecks = realGetReadinessChecks;
}

test.afterEach(() => {
  restoreDbOps();
});

test("GET /api returns service status", async () => {
  const response = await request(app).get("/api/");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "InfiLearn LMS backend is running");
});

test("GET /api/health returns db time", async () => {
  mockDbOps({
    ping: async () => "2026-03-27T00:00:00.000Z"
  });

  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, "ok");
});

test("GET /api/readiness returns ready when schema tables exist", async () => {
  mockDbOps({
    ping: async () => "2026-03-27T00:00:00.000Z",
    getReadinessChecks: async () => ({
      tables: {
        users: true,
        courses: true,
        modules: true,
        lessons: true,
        quizzes: true,
        enrollments: true
      },
      missingTables: []
    })
  });

  const response = await request(app).get("/api/readiness");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, "ready");
  assert.deepEqual(response.body.checks.missingTables, []);
});

test("POST /api/auth/register validates required fields", async () => {
  const response = await request(app).post("/api/auth/register").send({ email: "a@b.com" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/courses requires auth token", async () => {
  const response = await request(app).post("/api/courses").send({ title: "Course 1" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/modules/:moduleId/lessons requires auth token", async () => {
  const response = await request(app).post("/api/modules/1/lessons").send({ title: "Lesson A" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
