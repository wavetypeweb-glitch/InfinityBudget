const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");
const config = require("../config/env");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  if (err instanceof ZodError) {
    statusCode = 422;
    message = "Request validation failed";
    details = err.errors.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyPattern || {});
    message = `${keys.join(", ") || "Resource"} already exists`;
  }

  const response = {
    success: false,
    message,
    details
  };

  if (!config.isProduction) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  errorHandler,
  notFound
};
