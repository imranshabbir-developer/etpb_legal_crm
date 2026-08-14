const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class AppSetting extends Model {}

AppSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "AppSetting",
    tableName: "app_settings",
  },
);

module.exports = { AppSetting };
