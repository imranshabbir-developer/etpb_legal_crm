const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Court extends Model {
  toApiJSON() {
    return {
      id: this.slug,
      slug: this.slug,
      name: this.name,
      layer: this.layer,
      categories: Array.isArray(this.categories) ? this.categories : [],
      sortOrder: this.sortOrder,
      isActive: this.isActive,
    };
  }
}

Court.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    layer: {
      type: DataTypes.ENUM("internal", "external"),
      allowNull: false,
    },
    categories: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    sequelize,
    modelName: "Court",
    tableName: "courts",
  },
);

module.exports = { Court };
