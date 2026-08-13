const { Op } = require("sequelize");
const { User, Role, Permission } = require("../../models");
const { ApiError } = require("../../utils/ApiError");
const { hashPassword } = require("../../utils/password");
const { assertCanAssignRole, canManageRole, toApiUser } = require("./users.helpers");

async function loadUserWithRole(id) {
  return User.findByPk(id, {
    include: [
      {
        model: Role,
        include: [{ model: Permission, through: { attributes: [] } }],
      },
    ],
  });
}

async function listUsers() {
  const users = await User.findAll({
    include: [
      {
        model: Role,
        include: [{ model: Permission, through: { attributes: [] } }],
      },
    ],
    order: [
      ["name", "ASC"],
      ["email", "ASC"],
    ],
  });

  return users.map(toApiUser);
}

async function createUser(actor, payload) {
  assertCanAssignRole(actor, payload.role);

  const role = await Role.findOne({ where: { slug: payload.role, isActive: true } });
  if (!role) {
    throw new ApiError(400, `Role "${payload.role}" not found`);
  }

  const existing = await User.findOne({
    where: { email: { [Op.iLike]: payload.email.trim() } },
  });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const passwordHash = await hashPassword(payload.password);
  const created = await User.create({
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    passwordHash,
    roleId: role.id,
    status: payload.status || "Active",
  });

  const full = await loadUserWithRole(created.id);
  return toApiUser(full);
}

async function updateUser(actor, userId, payload) {
  const target = await loadUserWithRole(userId);
  if (!target) {
    throw new ApiError(404, "User not found");
  }

  const targetSlug = target.Role?.slug;
  if (!targetSlug || !canManageRole(actor.Role.slug, targetSlug) || targetSlug === "super-admin") {
    throw new ApiError(403, "You cannot modify this user");
  }

  if (payload.role) {
    assertCanAssignRole(actor, payload.role);
  }

  if (payload.email) {
    const existing = await User.findOne({
      where: {
        email: { [Op.iLike]: payload.email.trim() },
        id: { [Op.ne]: userId },
      },
    });
    if (existing) {
      throw new ApiError(409, "A user with this email already exists");
    }
  }

  const updates = {};
  if (payload.name) updates.name = payload.name.trim();
  if (payload.email) updates.email = payload.email.trim().toLowerCase();
  if (payload.status) updates.status = payload.status;
  if (payload.password) updates.passwordHash = await hashPassword(payload.password);

  if (payload.role) {
    const role = await Role.findOne({ where: { slug: payload.role, isActive: true } });
    if (!role) throw new ApiError(400, `Role "${payload.role}" not found`);
    updates.roleId = role.id;
  }

  await target.update(updates);
  const full = await loadUserWithRole(userId);
  return toApiUser(full);
}

async function updateUserStatus(actor, userId, status) {
  return updateUser(actor, userId, { status });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  updateUserStatus,
};
