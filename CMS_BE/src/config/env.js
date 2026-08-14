require("dotenv").config();

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    dialect: "postgres",
    database: parsed.pathname.replace(/^\//, ""),
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
  };
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const required = hasDatabaseUrl
  ? ["JWT_SECRET"]
  : ["POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_HOST", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const dbFromUrl = hasDatabaseUrl ? parseDatabaseUrl(process.env.DATABASE_URL) : null;

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  apiPrefix: process.env.API_PREFIX || "/api",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  db: dbFromUrl || {
    dialect: process.env.DB_ENGINE || "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: Number(process.env.POSTGRES_PORT || 5432),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  },
  pgSsl: process.env.PGSSL === "true",
};

if (env.nodeEnv === "production" && String(env.jwt.secret).length < 24) {
  throw new Error("JWT_SECRET must be at least 24 characters in production");
}

module.exports = { env };
