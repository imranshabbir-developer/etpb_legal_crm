const { Court } = require("./Court");
const { Case } = require("./Case");
const { AppSetting } = require("./AppSetting");
const { Role } = require("./Role");
const { Permission } = require("./Permission");
const { RolePermission } = require("./RolePermission");
const { User } = require("./User");
const { Notification } = require("./Notification");

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
});

Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

RolePermission.belongsTo(Role, { foreignKey: "roleId" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId" });

Court.hasMany(Case, { foreignKey: "courtUuid", sourceKey: "id" });
Case.belongsTo(Court, { foreignKey: "courtUuid", targetKey: "id" });

User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });
Case.hasMany(Notification, { foreignKey: "caseId", onDelete: "CASCADE" });
Notification.belongsTo(Case, { foreignKey: "caseId" });

module.exports = {
  Court,
  Case,
  AppSetting,
  Role,
  Permission,
  RolePermission,
  User,
  Notification,
};
