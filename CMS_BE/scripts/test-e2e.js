/**
 * End-to-end API + dashboard contract test.
 * Covers every mounted route, UI payload shapes, and dashboard consistency.
 * Creates uniquely named rows then cleans them up — never duplicates seeded demo data.
 *
 * Usage: node scripts/test-e2e.js
 * Env: API_BASE (default http://127.0.0.1:4000/api), FE_BASE (default http://127.0.0.1:3000)
 */
const API_BASE = process.env.API_BASE || "http://127.0.0.1:4000/api";
const FE_BASE = (process.env.FE_BASE || "http://127.0.0.1:3000").replace(/\/$/, "");

const failures = [];
const notes = [];

function fail(label, detail) {
  failures.push(`${label}: ${detail}`);
  console.error("FAIL", label, detail);
}

function ok(label, extra = "") {
  console.log("OK  ", label, extra);
}

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
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
  return {
    token: result.body.data.token,
    user: result.body.data.user,
  };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function assertStatus(label, result, expected) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(result.status)) {
    fail(label, `expected ${allowed.join("|")}, got ${result.status} ${JSON.stringify(result.body)}`);
    return false;
  }
  ok(label, String(result.status));
  return true;
}

function assertShape(label, value, checks) {
  for (const [key, predicate] of Object.entries(checks)) {
    const v = value?.[key];
    if (!predicate(v)) {
      fail(label, `bad field "${key}": ${JSON.stringify(v)}`);
      return false;
    }
  }
  ok(label);
  return true;
}

async function probeFe(path) {
  try {
    const res = await fetch(`${FE_BASE}${path}`, {
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    // Vite/TanStack may 200 or redirect; treat network success as reachable.
    if (res.status >= 200 && res.status < 500) {
      ok(`FE ${path}`, String(res.status));
      return true;
    }
    fail(`FE ${path}`, `status ${res.status}`);
    return false;
  } catch (err) {
    notes.push(`FE not reachable at ${FE_BASE}${path} (${err.message}) — API-only pass continues`);
    console.warn("SKIP FE", path, err.message);
    return false;
  }
}

async function main() {
  const stamp = Date.now();
  console.log("E2E API+dashboard test");
  console.log("API", API_BASE);
  console.log("FE ", FE_BASE);
  console.log("stamp", stamp);

  // ——— Health / roles / auth ———
  const health = await request("/health");
  assertStatus("GET /health", health, 200);

  const roles = await request("/roles");
  assertStatus("GET /roles", roles, 200);
  if (!Array.isArray(roles.body?.data) || roles.body.data.length < 3) {
    fail("GET /roles shape", "expected >=3 roles");
  }

  const admin = await loginAs("admin@ips.gov.pk", "Admin@123", "admin");
  const staff = await loginAs("staff@ips.gov.pk", "Staff@123", "staff");
  const superAdmin = await loginAs("superadmin@ips.gov.pk", "SuperAdmin@123", "super-admin");
  ok("login admin/staff/super-admin");

  const me = await request("/auth/me", { headers: auth(admin.token) });
  assertStatus("GET /auth/me", me, 200);
  assertShape("auth/me payload", me.body.data, {
    email: (v) => v === "admin@ips.gov.pk",
    role: (v) => v === "admin",
    permissions: (v) => Array.isArray(v) && v.includes("cases:view"),
  });

  const logout = await request("/auth/logout", {
    method: "POST",
    headers: auth(admin.token),
  });
  assertStatus("POST /auth/logout", logout, [200, 204]);

  // Re-login admin after logout (token may still work if JWT-stateless; that's OK)
  const admin2 = await loginAs("admin@ips.gov.pk", "Admin@123", "admin");
  const adminToken = admin2.token;

  const authPwd = await request("/auth/change-password", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({ currentPassword: "Admin@123", newPassword: "Admin@123" }),
  });
  assertStatus("POST /auth/change-password", authPwd, 200);

  // ——— Courts ———
  const courts = await request("/courts", { headers: auth(adminToken) });
  assertStatus("GET /courts", courts, 200);
  const courtList = courts.body?.data || [];
  if (!Array.isArray(courtList) || courtList.length < 1) {
    fail("GET /courts", "empty court list");
  }
  const activeInternal = courtList.find((c) => c.layer === "internal" && c.isActive !== false);
  const activeExternal = courtList.find((c) => c.layer === "external" && c.isActive !== false);
  if (!activeInternal || !activeExternal) {
    fail("GET /courts layers", "missing active internal/external court");
  }

  const courtBySlug = await request(`/courts/${activeInternal.slug}`, { headers: auth(adminToken) });
  assertStatus("GET /courts/:slug", courtBySlug, 200);

  const courtById = await request(`/courts/${activeInternal.id}`, { headers: auth(adminToken) });
  assertStatus("GET /courts/:id", courtById, 200);

  const e2eCourtSlug = `e2e-court-${stamp}`;
  const createdCourt = await request("/courts", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      name: `E2E COURT ${stamp}`,
      layer: "internal",
      categories: ["pending-cases", "decided-cases"],
    }),
  });
  assertStatus("POST /courts", createdCourt, 201);
  const e2eCourtId = createdCourt.body?.data?.id;
  const e2eCourtSlugActual = createdCourt.body?.data?.slug || e2eCourtSlug;

  if (e2eCourtId) {
    const patchedCourt = await request(`/courts/${e2eCourtId}`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ name: `E2E COURT UPDATED ${stamp}` }),
    });
    assertStatus("PATCH /courts/:id", patchedCourt, 200);
  }

  // ——— Cases ———
  const casesAll = await request("/cases", { headers: auth(adminToken) });
  assertStatus("GET /cases", casesAll, 200);
  const allCases = Array.isArray(casesAll.body?.data) ? casesAll.body.data : [];
  if (allCases.length < 1) {
    fail("GET /cases", "expected seeded cases");
  }

  const paged = await request("/cases?page=1&limit=10", { headers: auth(adminToken) });
  assertStatus("GET /cases paginated", paged, 200);
  assertShape("cases pagination payload", paged.body.data, {
    items: (v) => Array.isArray(v) && v.length > 0 && v.length <= 10,
    pagination: (v) => v && v.total >= allCases.length && v.pages >= 1,
  });

  const filtered = await request(
    `/cases?layer=internal&courtId=${encodeURIComponent(activeInternal.slug)}&category=pending-cases`,
    { headers: auth(adminToken) },
  );
  assertStatus("GET /cases filtered", filtered, 200);

  const caseNo = `E2E/CASE-${stamp}`;
  const createCase = await request("/cases", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      caseNo,
      caseCategory: "pending-cases",
      courtId: activeInternal.slug,
      layer: "internal",
      caseTitled: `E2E dashboard case ${stamp}`,
      nameOfCounsel: "E2E Counsel",
      caseStatus: "Pending",
      nextDateOfHearing: new Date().toISOString().slice(0, 10),
      dateOfInstitution: new Date().toISOString().slice(0, 10),
    }),
  });
  assertStatus("POST /cases", createCase, 201);
  const caseId = createCase.body?.data?.id;

  // Duplicate must 409 — no silent duplicates
  const dup = await request("/cases", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      caseNo,
      caseCategory: "pending-cases",
      courtId: activeInternal.slug,
      layer: "internal",
      caseTitled: "duplicate should fail",
    }),
  });
  assertStatus("POST /cases duplicate → 409", dup, 409);

  if (caseId) {
    const getOne = await request(`/cases/${caseId}`, { headers: auth(adminToken) });
    assertStatus("GET /cases/:id", getOne, 200);

    const patch = await request(`/cases/${caseId}`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ caseTitled: `E2E updated ${stamp}`, caseStatus: "Pending" }),
    });
    assertStatus("PATCH /cases/:id", patch, 200);
  }

  const staffCreate = await request("/cases", {
    method: "POST",
    headers: auth(staff.token),
    body: JSON.stringify({
      caseNo: `E2E/STAFF-${stamp}`,
      caseCategory: "pending-cases",
      courtId: activeInternal.slug,
      layer: "internal",
      caseTitled: "staff forbidden",
    }),
  });
  assertStatus("POST /cases staff forbidden", staffCreate, 403);

  // ——— Dashboard consistency (UI contract) ———
  const summary = await request("/dashboard/summary", { headers: auth(adminToken) });
  assertStatus("GET /dashboard/summary", summary, 200);
  const s = summary.body?.data;
  assertShape("dashboard summary UI contract", s, {
    total: (v) => typeof v === "number" && v >= allCases.length,
    byLayer: (v) => v && typeof v.internal === "number" && typeof v.external === "number",
    byCategory: (v) =>
      v &&
      typeof v["pending-cases"] === "number" &&
      typeof v["decided-cases"] === "number" &&
      typeof v["restraining-order"] === "number" &&
      typeof v["direction-cases"] === "number",
    byCourt: (v) => v && typeof v === "object" && Object.keys(v).length > 0,
    monthly: (v) => Array.isArray(v) && v.length === 6,
    upcomingHearings: (v) => typeof v === "number",
    trends: (v) => v && typeof v.internal === "number" && typeof v.pending === "number",
    categorySplit: (v) => Array.isArray(v) && v.length === 4,
  });

  // Re-fetch cases after create for math check
  const casesAfter = await request("/cases", { headers: auth(adminToken) });
  const rows = Array.isArray(casesAfter.body?.data) ? casesAfter.body.data : [];
  const layerInternal = rows.filter((r) => r.layer === "internal").length;
  const layerExternal = rows.filter((r) => r.layer === "external").length;
  const catPending = rows.filter((r) => r.caseCategory === "pending-cases").length;

  if (s.total !== rows.length) {
    fail("dashboard.total vs GET /cases", `${s.total} !== ${rows.length}`);
  } else {
    ok("dashboard.total matches cases list", String(s.total));
  }
  if (s.byLayer.internal !== layerInternal || s.byLayer.external !== layerExternal) {
    fail(
      "dashboard.byLayer vs cases",
      `summary ${JSON.stringify(s.byLayer)} vs computed {internal:${layerInternal},external:${layerExternal}}`,
    );
  } else {
    ok("dashboard.byLayer matches cases");
  }
  if (s.byCategory["pending-cases"] !== catPending) {
    fail("dashboard.byCategory pending", `${s.byCategory["pending-cases"]} !== ${catPending}`);
  } else {
    ok("dashboard.byCategory pending matches");
  }

  const courtBucket = s.byCourt?.[activeInternal.slug];
  const courtComputed = rows.filter((r) => r.courtId === activeInternal.slug || r.courtSlug === activeInternal.slug)
    .length;
  if (!courtBucket || courtBucket.total !== courtComputed) {
    fail(
      "dashboard.byCourt",
      `${activeInternal.slug} summary=${courtBucket?.total} computed=${courtComputed}`,
    );
  } else {
    ok("dashboard.byCourt matches", `${activeInternal.slug}=${courtBucket.total}`);
  }

  // ——— Reminders + notifications (dashboard panels) ———
  const reminders = await request("/reminders?limit=50", { headers: auth(adminToken) });
  assertStatus("GET /reminders", reminders, 200);
  assertShape("reminders UI payload", reminders.body.data, {
    items: (v) => Array.isArray(v),
    counts: (v) => v && typeof v.total === "number" && typeof v.today === "number",
  });

  const notifications = await request("/notifications", { headers: auth(adminToken) });
  assertStatus("GET /notifications", notifications, 200);
  assertShape("notifications UI payload", notifications.body.data, {
    items: (v) => Array.isArray(v),
    unreadCount: (v) => typeof v === "number",
  });

  const inbox = notifications.body?.data?.items || [];
  if (inbox.length > 0) {
    const first = inbox[0];
    const markOne = await request(`/notifications/${first.id}/read`, {
      method: "PATCH",
      headers: auth(adminToken),
    });
    assertStatus("PATCH /notifications/:id/read", markOne, 200);
  } else {
    notes.push("No notifications to mark-read (inbox empty for admin)");
  }

  const markAll = await request("/notifications/read-all", {
    method: "POST",
    headers: auth(adminToken),
  });
  assertStatus("POST /notifications/read-all", markAll, 200);

  // ——— Users ———
  const users = await request("/users", { headers: auth(adminToken) });
  assertStatus("GET /users", users, 200);
  if (!Array.isArray(users.body?.data) || users.body.data.length < 3) {
    fail("GET /users", "expected seeded users");
  }

  const e2eEmail = `e2e.user.${stamp}@ips.gov.pk`;
  const createdUser = await request("/users", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      name: `E2E User ${stamp}`,
      email: e2eEmail,
      password: "E2eUser@123",
      role: "staff",
      status: "Active",
    }),
  });
  assertStatus("POST /users", createdUser, 201);
  const e2eUserId = createdUser.body?.data?.id;

  // Duplicate email must fail
  const dupUser = await request("/users", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      name: "Dup",
      email: e2eEmail,
      password: "E2eUser@123",
      role: "staff",
    }),
  });
  assertStatus("POST /users duplicate → 409/400", dupUser, [400, 409]);

  if (e2eUserId) {
    const patchedUser = await request(`/users/${e2eUserId}`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ name: `E2E User Updated ${stamp}` }),
    });
    assertStatus("PATCH /users/:id", patchedUser, 200);

    const statusOff = await request(`/users/${e2eUserId}/status`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ status: "Inactive" }),
    });
    assertStatus("PATCH /users/:id/status", statusOff, 200);
  }

  const staffUsers = await request("/users", { headers: auth(staff.token) });
  assertStatus("GET /users staff forbidden", staffUsers, 403);

  // ——— Settings ———
  const profile = await request("/settings/profile", { headers: auth(adminToken) });
  assertStatus("GET /settings/profile", profile, 200);

  const profilePatch = await request("/settings/profile", {
    method: "PATCH",
    headers: auth(adminToken),
    body: JSON.stringify({ name: profile.body?.data?.name || "IPS Admin" }),
  });
  assertStatus("PATCH /settings/profile", profilePatch, 200);

  const modules = await request("/settings/modules", { headers: auth(adminToken) });
  assertStatus("GET /settings/modules", modules, 200);
  assertShape("modules UI flags", modules.body.data, {
    showInternalModule: (v) => typeof v === "boolean",
    showExternalModule: (v) => typeof v === "boolean",
    showChartsModule: (v) => typeof v === "boolean",
  });

  const adminModules = await request("/settings/modules", {
    method: "PATCH",
    headers: auth(adminToken),
    body: JSON.stringify({
      showInternalModule: true,
      showExternalModule: true,
      showChartsModule: true,
    }),
  });
  assertStatus("PATCH /settings/modules admin forbidden", adminModules, 403);

  const superModules = await request("/settings/modules", {
    method: "PATCH",
    headers: auth(superAdmin.token),
    body: JSON.stringify({
      showInternalModule: true,
      showExternalModule: true,
      showChartsModule: true,
    }),
  });
  assertStatus("PATCH /settings/modules super-admin", superModules, 200);

  const settingsPwd = await request("/settings/password", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({ currentPassword: "Admin@123", newPassword: "Admin@123" }),
  });
  assertStatus("POST /settings/password", settingsPwd, 200);

  // ——— Cleanup created rows (no leftover duplicates) ———
  if (caseId) {
    const del = await request(`/cases/${caseId}`, {
      method: "DELETE",
      headers: auth(adminToken),
    });
    assertStatus("DELETE /cases/:id cleanup", del, 200);
  }

  if (e2eCourtId) {
    const deactivate = await request(`/courts/${e2eCourtId}`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ isActive: false }),
    });
    assertStatus("PATCH /courts deactivate e2e", deactivate, 200);
  }

  // Soft-cleanup e2e user via inactive (already inactive); remove via cleanup:smoke pattern
  if (e2eUserId) {
    notes.push(`E2E user left Inactive: ${e2eEmail} (id ${e2eUserId}) — run npm run cleanup:smoke`);
  }

  // ——— Bulk delete + clear-category (register UI paths) ———
  const bulkA = await request("/cases", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      caseNo: `E2E/BULK-A-${stamp}`,
      caseCategory: "pending-cases",
      courtId: activeInternal.slug,
      layer: "internal",
      caseTitled: `E2E bulk A ${stamp}`,
    }),
  });
  const bulkB = await request("/cases", {
    method: "POST",
    headers: auth(adminToken),
    body: JSON.stringify({
      caseNo: `E2E/BULK-B-${stamp}`,
      caseCategory: "pending-cases",
      courtId: activeInternal.slug,
      layer: "internal",
      caseTitled: `E2E bulk B ${stamp}`,
    }),
  });
  assertStatus("POST /cases bulk-A", bulkA, 201);
  assertStatus("POST /cases bulk-B", bulkB, 201);
  const bulkIds = [bulkA.body?.data?.id, bulkB.body?.data?.id].filter(Boolean);
  if (bulkIds.length === 2) {
    const bulkDel = await request("/cases", {
      method: "DELETE",
      headers: auth(adminToken),
      body: JSON.stringify({ ids: bulkIds }),
    });
    assertStatus("DELETE /cases bulk ids", bulkDel, 200);
    if (bulkDel.body?.data?.removed !== 2) {
      fail("DELETE /cases bulk removed", `expected 2 got ${bulkDel.body?.data?.removed}`);
    } else {
      ok("bulk delete removed 2");
    }
  }

  // clear category on dedicated e2e court only (never touch seeded courts)
  if (e2eCourtId && e2eCourtSlugActual) {
    // reactivate briefly for clear test
    await request(`/courts/${e2eCourtId}`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ isActive: true }),
    });
    const clearCase = await request("/cases", {
      method: "POST",
      headers: auth(adminToken),
      body: JSON.stringify({
        caseNo: `E2E/CLEAR-${stamp}`,
        caseCategory: "pending-cases",
        courtId: e2eCourtSlugActual,
        layer: "internal",
        caseTitled: `E2E clear ${stamp}`,
      }),
    });
    if (clearCase.status === 201) {
      const cleared = await request(
        `/cases?courtId=${encodeURIComponent(e2eCourtSlugActual)}&category=pending-cases`,
        {
          method: "DELETE",
          headers: auth(adminToken),
        },
      );
      assertStatus("DELETE /cases clear court+category", cleared, 200);
      if ((cleared.body?.data?.removed || 0) < 1) {
        fail("clear category removed", String(cleared.body?.data?.removed));
      } else {
        ok("clear court category removed", String(cleared.body.data.removed));
      }
    } else {
      // court may still be inactive in list validation — record and continue
      notes.push(`clear-category create skipped: ${clearCase.status} ${JSON.stringify(clearCase.body)}`);
      assertStatus("POST /cases on e2e court for clear", clearCase, 201);
    }
    await request(`/courts/${e2eCourtId}`, {
      method: "PATCH",
      headers: auth(adminToken),
      body: JSON.stringify({ isActive: false }),
    });
  }

  // ——— Frontend shell reachability (dashboard + key routes) ———
  await probeFe("/");
  await probeFe("/dashboard");
  await probeFe("/internal");
  await probeFe("/external");
  await probeFe("/reminders");
  await probeFe("/notifications");
  await probeFe("/users");
  await probeFe("/settings");

  // Final dashboard still consistent after cleanup
  const summaryFinal = await request("/dashboard/summary", { headers: auth(adminToken) });
  assertStatus("GET /dashboard/summary final", summaryFinal, 200);
  const casesFinal = await request("/cases", { headers: auth(adminToken) });
  const finalRows = Array.isArray(casesFinal.body?.data) ? casesFinal.body.data : [];
  if (summaryFinal.body?.data?.total !== finalRows.length) {
    fail(
      "final dashboard.total",
      `${summaryFinal.body?.data?.total} !== ${finalRows.length}`,
    );
  } else {
    ok("final dashboard.total stable", String(finalRows.length));
  }

  console.log("\n——— NOTES ———");
  for (const n of notes) console.log("-", n);

  if (failures.length) {
    console.error("\nE2E FAILED:");
    for (const f of failures) console.error("-", f);
    process.exit(1);
  }

  console.log("\nE2E PASSED — all APIs + dashboard consistency checks green");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
