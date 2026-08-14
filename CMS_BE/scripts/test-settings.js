/**
 * Phase 6 settings API smoke test.
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
  console.log("Testing settings API at", BASE);

  const adminToken = await loginAs("admin@ips.gov.pk", "Admin@123", "admin");
  const superToken = await loginAs("superadmin@ips.gov.pk", "SuperAdmin@123", "super-admin");
  const staffToken = await loginAs("staff@ips.gov.pk", "Staff@123", "staff");

  const profile = await request("/settings/profile", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("GET /settings/profile", profile.status, profile.body?.data?.email);

  const updated = await request("/settings/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: "IPS Admin" }),
  });
  console.log("PATCH /settings/profile", updated.status, updated.body?.data?.name);

  const modules = await request("/settings/modules", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("GET /settings/modules", modules.status, modules.body?.data);

  const adminPatchModules = await request("/settings/modules", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      showInternalModule: true,
      showExternalModule: true,
      showChartsModule: true,
    }),
  });
  console.log("PATCH /settings/modules (admin forbidden)", adminPatchModules.status);

  const superPatch = await request("/settings/modules", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${superToken}` },
    body: JSON.stringify({
      showInternalModule: true,
      showExternalModule: true,
      showChartsModule: true,
    }),
  });
  console.log("PATCH /settings/modules (super)", superPatch.status);

  const staffProfilePatch = await request("/settings/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({ name: "Should Fail" }),
  });
  console.log("PATCH /settings/profile (staff forbidden)", staffProfilePatch.status);

  const pwd = await request("/settings/password", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      currentPassword: "Admin@123",
      newPassword: "Admin@123",
    }),
  });
  console.log("POST /settings/password", pwd.status);

  if (
    profile.status !== 200 ||
    updated.status !== 200 ||
    modules.status !== 200 ||
    adminPatchModules.status !== 403 ||
    superPatch.status !== 200 ||
    staffProfilePatch.status !== 403 ||
    pwd.status !== 200
  ) {
    console.error("Phase 6 settings smoke test FAILED");
    process.exit(1);
  }

  console.log("Phase 6 settings smoke test PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
