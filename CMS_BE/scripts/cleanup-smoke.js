require("dotenv").config();
const { Client } = require("pg");

/**
 * Dev cleanup only: deactivate leftover smoke-test courts and remove inactive
 * API smoke users created by tests. Does not touch seeded demo data.
 */
async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("cleanup-smoke is blocked in production");
    process.exit(1);
  }

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

  const users = await client.query(`
    DELETE FROM users
    WHERE email LIKE 'phase1.user.%@ips.gov.pk'
       OR email LIKE 'notification.test.%@ips.gov.pk'
       OR email LIKE 'e2e.user.%@ips.gov.pk'
    RETURNING email
  `);

  const courts = await client.query(`
    UPDATE courts
    SET is_active = false, updated_at = NOW()
    WHERE (slug LIKE 'smoke-test-court-%' OR slug LIKE 'e2e-court-%') AND is_active = true
    RETURNING slug
  `);

  console.log("Deactivated smoke courts:", courts.rows.map((r) => r.slug));
  console.log("Removed smoke users:", users.rows.map((r) => r.email));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
