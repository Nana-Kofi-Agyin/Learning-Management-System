# Setup and Run Guide

## Backend Prerequisites

- Node.js (recommended current LTS)
- MongoDB

## Install Dependencies

From the `backend/` directory:

```bash
npm install
```

## Environment Variables

Create a `.env` file in `backend/` and define:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=*
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d

MONGO_URI=mongodb://127.0.0.1:27017/infilearn
MONGO_DB_NAME=infilearn
```

Notes:
- If `MONGO_URI` is missing, startup prints warnings and uses defaults.

## Initialize Database

Collections are created automatically by MongoDB as data is inserted.

## Run the Backend

Development mode (auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Syntax check:

```bash
npm run check
```

Run API contract tests:

```bash
npm test
```

## Verify Service

- `GET /api/` should confirm service is running.
- `GET /api/health` should return DB server time.
- `GET /api/readiness` should confirm required collections are present.

## Graceful Shutdown

On `Ctrl+C` or termination signal, the app:
- Stops accepting new HTTP connections.
- Closes MongoDB connections.
- Exits cleanly.
