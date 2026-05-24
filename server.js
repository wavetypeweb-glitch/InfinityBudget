const app = require("./app");
const config = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/db");

let server;

async function startServer() {
  await connectDatabase();

  server = app.listen(config.port, () => {
    console.log(`InfinityBudget API running on port ${config.port}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received. Closing InfinityBudget API...`);

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    await disconnectDatabase();
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
