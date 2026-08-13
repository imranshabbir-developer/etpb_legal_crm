require("dotenv").config();
const { sequelize } = require("../config/database");
require("../models");

async function migrate() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Database schema synced successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
