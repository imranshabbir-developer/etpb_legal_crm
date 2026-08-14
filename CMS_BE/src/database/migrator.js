const fs = require("fs");
const path = require("path");
const { QueryTypes } = require("sequelize");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMetaTable(sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
      name VARCHAR(255) NOT NULL PRIMARY KEY
    );
  `);
}

async function getApplied(sequelize) {
  const rows = await sequelize.query(`SELECT name FROM "SequelizeMeta" ORDER BY name ASC`, {
    type: QueryTypes.SELECT,
  });
  return new Set(rows.map((row) => row.name));
}

function loadMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".js"))
    .sort()
    .map((file) => ({
      name: file.replace(/\.js$/, ""),
      fullPath: path.join(MIGRATIONS_DIR, file),
    }));
}

async function runPendingMigrations(sequelize) {
  await ensureMetaTable(sequelize);
  const applied = await getApplied(sequelize);
  const files = loadMigrationFiles();
  const pending = files.filter((file) => !applied.has(file.name));

  if (!pending.length) {
    console.log("No pending migrations.");
    return { applied: 0, pending: [] };
  }

  for (const file of pending) {
    const migration = require(file.fullPath);
    console.log(`Running migration: ${file.name}`);
    if (typeof migration.up !== "function") {
      throw new Error(`Migration ${file.name} is missing an up() export`);
    }
    await migration.up(sequelize);
    await sequelize.query(`INSERT INTO "SequelizeMeta" (name) VALUES (:name)`, {
      replacements: { name: file.name },
    });
    console.log(`Applied migration: ${file.name}`);
  }

  return { applied: pending.length, pending: pending.map((p) => p.name) };
}

module.exports = {
  runPendingMigrations,
  loadMigrationFiles,
};
