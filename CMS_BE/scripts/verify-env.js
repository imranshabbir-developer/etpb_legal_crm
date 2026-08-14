require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const needsDiscrete = !process.env.DATABASE_URL;
  const missingDiscrete = needsDiscrete
    ? ["POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_HOST", "JWT_SECRET"].filter(
        (key) => !process.env[key],
      )
    : ["JWT_SECRET"].filter((key) => !process.env[key]);

  if (missingDiscrete.length) {
    console.error("Missing required env vars:", missingDiscrete.join(", "));
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET || "";
  if (process.env.NODE_ENV === "production" && jwtSecret.length < 24) {
    console.error("JWT_SECRET must be at least 24 characters in production");
    process.exit(1);
  }
  if (jwtSecret.length < 12) {
    console.warn("Warning: JWT_SECRET is short; use a longer random secret for staging/production.");
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

  try {
    await client.connect();
    const result = await client.query("SELECT 1 AS ok");
    console.log("Env OK. Postgres reachable. ping=", result.rows[0]?.ok);
    process.exit(0);
  } catch (error) {
    console.error("Postgres connection failed:", error.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
