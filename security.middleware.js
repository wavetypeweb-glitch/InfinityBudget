const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const config = require("../config/env");

function securityMiddleware(app) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      const isLocalDevOrigin = !config.isProduction && (
        origin === "null" ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "")
      );

      if (!origin || isLocalDevOrigin || config.clientUrls.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(morgan(config.isProduction ? "combined" : config.logLevel));
}

module.exports = securityMiddleware;
