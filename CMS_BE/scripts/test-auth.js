/**
 * Quick smoke test for auth + roles endpoints.
 * Usage: node scripts/test-auth.js
 * Requires API running on PORT (default 4000).
 */
const BASE = process.env.API_BASE || "http://127.0.0.1:4000/api";

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(extraHeaders || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log("Testing", BASE);

  const health = await request("/health");
  console.log("GET /health", health.status, health.body.message);

  const roles = await request("/roles");
  console.log(
    "GET /roles",
    roles.status,
    Array.isArray(roles.body.data) ? roles.body.data.map((r) => r.slug).join(", ") : roles.body,
  );

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@ips.gov.pk",
      password: "Admin@123",
      role: "admin",
    }),
  });
  console.log("POST /auth/login", login.status, login.body.message);
  if (!login.body?.data?.token) {
    console.error("Login failed payload:", login.body);
    process.exit(1);
  }

  const me = await request("/auth/me", {
    headers: { Authorization: `Bearer ${login.body.data.token}` },
  });
  console.log("GET /auth/me", me.status, me.body?.data?.email, me.body?.data?.role);

  const bad = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@ips.gov.pk",
      password: "wrong-password",
    }),
  });
  console.log("POST /auth/login (bad password)", bad.status, bad.body.message);

  const roleMismatch = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@ips.gov.pk",
      password: "Admin@123",
      role: "staff",
    }),
  });
  console.log("POST /auth/login (role mismatch)", roleMismatch.status, roleMismatch.body.message);

  console.log("Auth smoke test completed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
