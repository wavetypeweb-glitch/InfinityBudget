const express = require("express");
const routes = require("./routes");
const securityMiddleware = require("./middlewares/security.middleware");
const { errorHandler, notFound } = require("./middlewares/error.middleware");
const { standardLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

securityMiddleware(app);

app.use("/api", standardLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
