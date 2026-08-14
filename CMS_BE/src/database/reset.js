require("dotenv").config();

/**
 * Dev-only database reset: drop all tables, re-run migrations, then seed via npm script.
 * Refuses to run when NODE_ENV=production.
 */
if (process.env.NODE_ENV === "production") {
  console.error("db:reset is blocked in production");
  process.exit(1);
}

const { sequelize } = require("../config/database");
const { runPendingMigrations } = require("./migrator");

async function reset() {
  try {
    await sequelize.authenticate();
    await sequelize.drop();
    await sequelize.query('DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;');
    const result = await runPendingMigrations(sequelize);
    console.log(
      result.applied
        ? `Database reset complete (${result.applied} migrations applied).`
        : "Database reset complete.",
    );
    process.exit(0);
  } catch (error) {
    console.error("Database reset failed:", error);
    process.exit(1);
  }
}

reset();
