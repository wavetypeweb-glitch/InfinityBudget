const app = require("./app");
const config = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/db");

let server;
let databaseRetryTimer;

async function connectDatabaseWithRetry() {
  try {
    await connectDatabase();
    console.log("InfinityBudget database connected");
  } catch (error) {
    console.error("InfinityBudget database connection failed", error);

    const retryMs = Number(process.env.DATABASE_RETRY_MS) || 30000;
    databaseRetryTimer = setTimeout(connectDatabaseWithRetry, retryMs);

    if (typeof databaseRetryTimer.unref === "function") {
      databaseRetryTimer.unref();
    }
  }
}

async function startServer() {
  server = app.listen(config.port, () => {
    console.log(`InfinityBudget API running on port ${config.port}`);
  });

  connectDatabaseWithRetry();
}

function shutdown(signal) {
  console.log(`${signal} received. Closing InfinityBudget API...`);

  if (databaseRetryTimer) {
    clearTimeout(databaseRetryTimer);
  }

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    try {
      await disconnectDatabase();
    } catch (error) {
      console.error("Database disconnect failed", error);
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);
  shutdown("unhandledRejection");
});

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
