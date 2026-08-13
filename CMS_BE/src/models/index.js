const { Role } = require("./Role");
const { Permission } = require("./Permission");
const { RolePermission } = require("./RolePermission");
const { User } = require("./User");

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

module.exports = {
  Role,
  Permission,
  RolePermission,
  User,
};
