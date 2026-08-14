const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Notification extends Model {
  toApiJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      body: this.body,
      readAt: this.readAt,
      meta: this.meta || {},
      caseId: this.caseId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id",
    },
    caseId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "case_id",
    },
    type: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(240),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    indexes: [
      { fields: ["user_id", "read_at"] },
      { fields: ["case_id"] },
      {
        unique: true,
        name: "notifications_user_case_type_uq",
        fields: ["user_id", "case_id", "type"],
      },
    ],
  },
);

module.exports = { Notification };
