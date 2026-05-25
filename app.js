const express = require("express");
const path = require("node:path");
const routes = require("./routes");
const securityMiddleware = require("./middlewares/security.middleware");
const { errorHandler, notFound } = require("./middlewares/error.middleware");
const { standardLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

securityMiddleware(app);

app.use("/api", standardLimiter, routes);

const appHtmlPath = path.resolve(__dirname, "..", "infinitybudget.html");

app.get("/", (req, res) => {
  res.sendFile(appHtmlPath);
});

app.get("/infinitybudget.html", (req, res) => {
  res.sendFile(appHtmlPath);
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
