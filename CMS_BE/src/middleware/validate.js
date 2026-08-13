const { ZodError } = require("zod");
const { ApiError } = require("../utils/ApiError");

function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new ApiError(
            400,
            "Validation failed",
            error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          ),
        );
      }
      next(error);
    }
  };
}

module.exports = { validate };
