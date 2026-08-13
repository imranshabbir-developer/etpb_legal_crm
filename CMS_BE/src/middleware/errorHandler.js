const { ApiError } = require("../utils/ApiError");
const { fail } = require("../utils/response");

function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "Route not found"));
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const details = err.details || null;

  if (process.env.NODE_ENV !== "test") {
    console.error("[API Error]", {
      statusCode,
      message,
      details,
      stack: err.stack,
    });
  }

  return fail(res, statusCode, message, details);
}

module.exports = { notFoundHandler, errorHandler };
