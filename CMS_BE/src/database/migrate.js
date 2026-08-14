require("dotenv").config();
const { sequelize } = require("../config/database");
const { runPendingMigrations } = require("./migrator");

async function migrate() {
  try {
    await sequelize.authenticate();
    const result = await runPendingMigrations(sequelize);

    // Dev convenience: keep columns in sync while iterating on models.
    // Production / staging must rely on explicit migration files only.
    if (process.env.NODE_ENV !== "production" && process.env.DB_SYNC_ALTER !== "false") {
      require("../models");
      await sequelize.sync({ alter: true });
      console.log("Dev schema alter sync complete (disabled when NODE_ENV=production).");
    }

    console.log(
      result.applied
        ? `Migrations complete (${result.applied} applied).`
        : "Database migrations are up to date.",
    );
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
