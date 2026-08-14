require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const client = process.env.DATABASE_URL
    ? new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
      })
    : new Client({
        host: process.env.POSTGRES_HOST || "127.0.0.1",
        port: Number(process.env.POSTGRES_PORT || 5432),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
      });

  await client.connect();
  console.log("Connected to", process.env.POSTGRES_DB || process.env.DATABASE_URL);

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  console.log("\n=== TABLE COUNTS ===");
  for (const row of tables.rows) {
    const name = row.table_name;
    const count = await client.query(`SELECT COUNT(*)::int AS count FROM "${name}"`);
    console.log(`- ${name}: ${count.rows[0].count}`);
  }

  console.log("\n=== ROLES ===");
  console.log(
    (
      await client.query(
        `SELECT slug, name, is_active FROM roles ORDER BY slug`,
      )
    ).rows,
  );

  console.log("\n=== PERMISSIONS ===");
  console.log(
    (
      await client.query(
        `SELECT key, description FROM permissions ORDER BY key`,
      )
    ).rows,
  );

  console.log("\n=== ROLE PERMISSION COUNTS ===");
  console.log(
    (
      await client.query(`
        SELECT r.slug, COUNT(rp.permission_id)::int AS permission_count
        FROM roles r
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        GROUP BY r.slug
        ORDER BY r.slug
      `)
    ).rows,
  );

  console.log("\n=== USERS ===");
  console.log(
    (
      await client.query(`
        SELECT u.name, u.email, u.status, r.slug AS role
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        ORDER BY r.slug, u.email
      `)
    ).rows,
  );

  console.log("\n=== COURTS BY LAYER ===");
  console.log(
    (
      await client.query(`
        SELECT layer, COUNT(*)::int AS count,
               COUNT(*) FILTER (WHERE is_active)::int AS active
        FROM courts
        GROUP BY layer
        ORDER BY layer
      `)
    ).rows,
  );

  console.log("\n=== COURT DETAILS ===");
  console.log(
    (
      await client.query(`
        SELECT slug, name, layer, categories, is_active, sort_order
        FROM courts
        ORDER BY layer, sort_order, name
      `)
    ).rows,
  );

  console.log("\n=== CASES BY LAYER/CATEGORY ===");
  console.log(
    (
      await client.query(`
        SELECT layer, case_category, COUNT(*)::int AS count
        FROM cases
        GROUP BY layer, case_category
        ORDER BY layer, case_category
      `)
    ).rows,
  );

  console.log("\n=== CASES HEARING DATE BUCKETS ===");
  console.log(
    (
      await client.query(`
        SELECT
          COUNT(*) FILTER (
            WHERE next_date_of_hearing ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
              AND next_date_of_hearing::date < CURRENT_DATE
          )::int AS overdue,
          COUNT(*) FILTER (
            WHERE next_date_of_hearing ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
              AND next_date_of_hearing::date = CURRENT_DATE
          )::int AS today,
          COUNT(*) FILTER (
            WHERE next_date_of_hearing ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
              AND next_date_of_hearing::date = CURRENT_DATE + 1
          )::int AS tomorrow,
          COUNT(*) FILTER (
            WHERE next_date_of_hearing ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
              AND next_date_of_hearing::date = CURRENT_DATE + 2
          )::int AS in_two_days,
          COUNT(*) FILTER (
            WHERE next_date_of_hearing ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
              AND next_date_of_hearing::date > CURRENT_DATE + 2
          )::int AS later_upcoming,
          COUNT(*) FILTER (
            WHERE next_date_of_hearing IS NULL
               OR next_date_of_hearing = ''
               OR next_date_of_hearing = '—'
               OR next_date_of_hearing !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          )::int AS missing_or_invalid
        FROM cases
      `)
    ).rows[0],
  );

  console.log("\n=== APP SETTINGS ===");
  console.log((await client.query(`SELECT key, value FROM app_settings ORDER BY key`)).rows);

  console.log("\n=== SEQUELIZE META ===");
  try {
    console.log((await client.query(`SELECT name FROM "SequelizeMeta" ORDER BY name`)).rows);
  } catch {
    console.log("SequelizeMeta missing");
  }

  // orphan checks
  console.log("\n=== INTEGRITY CHECKS ===");
  const orphanCases = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM cases c
    LEFT JOIN courts ct ON ct.id = c.court_uuid
    WHERE c.court_uuid IS NOT NULL AND ct.id IS NULL
  `);
  const usersNoRole = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE r.id IS NULL
  `);
  const inactiveCourts = await client.query(`
    SELECT slug, name, layer FROM courts WHERE is_active = false ORDER BY name
  `);
  console.log({
    orphanCasesMissingCourt: orphanCases.rows[0].count,
    usersMissingRole: usersNoRole.rows[0].count,
    inactiveCourts: inactiveCourts.rows,
  });

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
