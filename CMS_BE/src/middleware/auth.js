const { ApiError } = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/jwt");
const { User, Role, Permission } = require("../models");

function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = verifyAccessToken(token);
    req.auth = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }
    next(error);
  }
}

async function loadCurrentUser(req, _res, next) {
  try {
    const user = await User.findByPk(req.auth.sub, {
      include: [
        {
          model: Role,
          include: [{ model: Permission, through: { attributes: [] } }],
        },
      ],
    });

    if (!user || user.status !== "Active") {
      throw new ApiError(401, "User session is no longer valid");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function authorize(...permissionKeys) {
  return (req, _res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      if (!permissionKeys.length) {
        return next();
      }

      const userPermissions = (req.user.Role?.Permissions || []).map((p) => p.key);
      const allowed = permissionKeys.some((key) => userPermissions.includes(key));

      if (!allowed) {
        throw new ApiError(403, "You do not have permission for this action");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { authenticate, loadCurrentUser, authorize };
