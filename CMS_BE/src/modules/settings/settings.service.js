const { Op } = require("sequelize");
const { User, Role, Permission, AppSetting } = require("../../models");
const { ApiError } = require("../../utils/ApiError");
const { changePassword } = require("../auth/auth.service");

const MODULES_KEY = "modules";
const DEFAULT_MODULES = {
  showInternalModule: true,
  showExternalModule: true,
  showChartsModule: true,
};

async function loadUser(userId) {
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
  return user;
}

function toProfile(user) {
  const safe = user.toSafeJSON();
  return {
    id: safe.id,
    name: safe.name,
    email: safe.email,
    status: safe.status,
    role: safe.role.slug,
    roleName: safe.role.name,
    permissions: safe.permissions,
  };
}

async function getProfile(userId) {
  const user = await loadUser(userId);
  return toProfile(user);
}

async function updateProfile(userId, payload) {
  const user = await loadUser(userId);

  if (payload.email && payload.email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({
      where: {
        email: { [Op.iLike]: payload.email.trim() },
        id: { [Op.ne]: userId },
      },
    });
    if (existing) {
      throw new ApiError(409, "Email is already in use");
    }
  }

  await user.update({
    ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
    ...(payload.email !== undefined ? { email: payload.email.trim().toLowerCase() } : {}),
  });

  const refreshed = await loadUser(userId);
  return toProfile(refreshed);
}

async function updatePassword(userId, payload) {
  return changePassword(userId, payload);
}

async function getModules() {
  const [row] = await AppSetting.findOrCreate({
    where: { key: MODULES_KEY },
    defaults: { key: MODULES_KEY, value: DEFAULT_MODULES },
  });
  return { ...DEFAULT_MODULES, ...(row.value || {}) };
}

async function updateModules(payload) {
  const [row] = await AppSetting.findOrCreate({
    where: { key: MODULES_KEY },
    defaults: { key: MODULES_KEY, value: DEFAULT_MODULES },
  });
  const next = {
    showInternalModule: Boolean(payload.showInternalModule),
    showExternalModule: Boolean(payload.showExternalModule),
    showChartsModule: Boolean(payload.showChartsModule),
  };
  await row.update({ value: next });
  return next;
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getModules,
  updateModules,
  DEFAULT_MODULES,
};
