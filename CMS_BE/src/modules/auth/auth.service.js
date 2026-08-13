const { Op } = require("sequelize");
const { User, Role, Permission } = require("../../models");
const { ApiError } = require("../../utils/ApiError");
const { comparePassword, hashPassword } = require("../../utils/password");
const { signAccessToken } = require("../../utils/jwt");

async function findUserByEmail(email) {
  return User.findOne({
    where: {
      email: {
        [Op.iLike]: email.trim(),
      },
    },
    include: [
      {
        model: Role,
        include: [{ model: Permission, through: { attributes: [] } }],
      },
    ],
  });
}

async function login({ email, password, role }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== "Active") {
    throw new ApiError(403, "Account is inactive. Contact an administrator.");
  }

  if (!user.Role || !user.Role.isActive) {
    throw new ApiError(403, "Assigned role is inactive");
  }

  const passwordOk = await comparePassword(password, user.passwordHash);
  if (!passwordOk) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (role && user.Role.slug !== role) {
    throw new ApiError(403, `This account is not assigned the "${role}" role`);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const safeUser = user.toSafeJSON();
  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.Role.slug,
  });

  return {
    token,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    user: {
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      status: safeUser.status,
      role: safeUser.role.slug,
      roleName: safeUser.role.name,
      permissions: safeUser.permissions,
    },
  };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
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

  const safeUser = user.toSafeJSON();
  return {
    id: safeUser.id,
    name: safeUser.name,
    email: safeUser.email,
    status: safeUser.status,
    role: safeUser.role.slug,
    roleName: safeUser.role.name,
    permissions: safeUser.permissions,
  };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findByPk(userId);
  if (!user || user.status !== "Active") {
    throw new ApiError(401, "User session is no longer valid");
  }

  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { changed: true };
}

module.exports = { login, getProfile, changePassword };
