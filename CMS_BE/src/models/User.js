const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class User extends Model {
  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      status: this.status,
      role: this.Role
        ? {
            id: this.Role.id,
            name: this.Role.name,
            slug: this.Role.slug,
          }
        : null,
      permissions: Array.isArray(this.Role?.Permissions)
        ? this.Role.Permissions.map((p) => p.key)
        : [],
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "role_id",
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  },
);

module.exports = { User };
