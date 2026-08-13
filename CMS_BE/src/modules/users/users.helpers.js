const { ApiError } = require("../../utils/ApiError");

function getPermissionKeys(user) {
  return (user.Role?.Permissions || []).map((p) => p.key);
}

function canManageRole(actorSlug, targetSlug) {
  if (actorSlug === "super-admin") return targetSlug !== "super-admin";
  if (actorSlug === "admin") return targetSlug === "staff" || targetSlug === "admin";
  return false;
}

function assertCanAssignRole(actor, targetRoleSlug) {
  const actorSlug = actor.Role?.slug;
  if (!actorSlug) {
    throw new ApiError(403, "Actor role missing");
  }

  if (targetRoleSlug === "super-admin") {
    throw new ApiError(403, "Cannot assign Super Admin role via this API");
  }

  if (!canManageRole(actorSlug, targetRoleSlug)) {
    throw new ApiError(403, `You cannot manage users with role "${targetRoleSlug}"`);
  }

  if (targetRoleSlug === "admin" && !getPermissionKeys(actor).includes("users:manage-admin")) {
    throw new ApiError(403, "Missing permission to manage admin users");
  }

  if (targetRoleSlug === "staff" && !getPermissionKeys(actor).includes("users:manage-staff")) {
    throw new ApiError(403, "Missing permission to manage staff users");
  }
}

function toApiUser(user) {
  const safe = user.toSafeJSON();
  return {
    id: safe.id,
    name: safe.name,
    email: safe.email,
    status: safe.status,
    role: safe.role?.slug || null,
    roleName: safe.role?.name || null,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  getPermissionKeys,
  canManageRole,
  assertCanAssignRole,
  toApiUser,
};
