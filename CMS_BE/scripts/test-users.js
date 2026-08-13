/**
 * Phase 1 users API smoke test.
 * Requires API running: npm run dev
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

async function loginAs(email, password, role) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  if (!result.body?.data?.token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(result.body)}`);
  }
  return result.body.data.token;
}

async function main() {
  console.log("Testing users API at", BASE);

  const adminToken = await loginAs("admin@ips.gov.pk", "Admin@123", "admin");
  const staffToken = await loginAs("staff@ips.gov.pk", "Staff@123", "staff");

  const list = await request("/users", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("GET /users (admin)", list.status, "count=", list.body?.data?.length);

  const staffList = await request("/users", {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  console.log("GET /users (staff)", staffList.status, staffList.body?.message);

  const unique = `phase1.user.${Date.now()}@ips.gov.pk`;
  const created = await request("/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "Phase1 Test User",
      email: unique,
      password: "TempPass@123",
      role: "staff",
      status: "Active",
    }),
  });
  console.log("POST /users", created.status, created.body?.data?.email);

  if (!created.body?.data?.id) {
    console.error(created.body);
    process.exit(1);
  }

  const userId = created.body.data.id;
  const toggled = await request(`/users/${userId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: "Inactive" }),
  });
  console.log("PATCH /users/:id/status", toggled.status, toggled.body?.data?.status);

  const updated = await request(`/users/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: "Phase1 Test User Updated" }),
  });
  console.log("PATCH /users/:id", updated.status, updated.body?.data?.name);

  const staffCreate = await request("/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      name: "Should Fail",
      email: `fail.${Date.now()}@ips.gov.pk`,
      password: "TempPass@123",
      role: "staff",
    }),
  });
  console.log("POST /users (staff forbidden)", staffCreate.status, staffCreate.body?.message);

  const pwd = await request("/auth/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      currentPassword: "Admin@123",
      newPassword: "Admin@123",
    }),
  });
  console.log("POST /auth/change-password", pwd.status, pwd.body?.message);

  const logout = await request("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("POST /auth/logout", logout.status, logout.body?.message);

  if (list.status !== 200 || list.body?.data?.length < 7) {
    console.error("Expected at least 7 seeded users");
    process.exit(1);
  }
  if (staffList.status !== 403) {
    console.error("Staff should be forbidden from listing users");
    process.exit(1);
  }
  if (created.status !== 201 || toggled.status !== 200 || staffCreate.status !== 403) {
    console.error("Users CRUD smoke checks failed");
    process.exit(1);
  }

  console.log("Phase 1 users smoke test PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
