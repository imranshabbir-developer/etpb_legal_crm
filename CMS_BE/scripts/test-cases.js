/**
 * Phase 3 cases API smoke test.
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
  console.log("Testing cases API at", BASE);

  const adminToken = await loginAs("admin@ips.gov.pk", "Admin@123", "admin");
  const staffToken = await loginAs("staff@ips.gov.pk", "Staff@123", "staff");

  const list = await request("/cases", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("GET /cases", list.status, "count=", list.body?.data?.length);

  const filtered = await request("/cases?courtId=federal-secretary&category=decided-cases", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(
    "GET filtered decided",
    filtered.status,
    "count=",
    filtered.body?.data?.length,
  );

  const paged = await request("/cases?page=1&limit=10", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(
    "GET /cases paginated",
    paged.status,
    "items=",
    paged.body?.data?.items?.length,
    "total=",
    paged.body?.data?.pagination?.total,
  );

  const created = await request("/cases", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNo: `IPS/INT/TEST-${Date.now()}`,
      caseCategory: "pending-cases",
      courtId: "federal-secretary",
      layer: "internal",
      caseTitled: "Phase3 smoke test case",
      nameOfCounsel: "Adv. Test",
      dateOfInstitution: "2026-01-15",
      nextDateOfHearing: "2026-09-01",
      caseStatus: "Pending",
    }),
  });
  console.log("POST /cases", created.status, created.body?.data?.caseNo);

  if (!created.body?.data?.id) {
    console.error(created.body);
    process.exit(1);
  }

  const caseId = created.body.data.id;
  const patched = await request(`/cases/${caseId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ remarks: "Updated by smoke test" }),
  });
  console.log("PATCH /cases/:id", patched.status, patched.body?.data?.remarks);

  const staffCreate = await request("/cases", {
    method: "POST",
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      caseNo: `IPS/INT/FAIL-${Date.now()}`,
      caseCategory: "pending-cases",
      courtId: "federal-secretary",
      layer: "internal",
      caseTitled: "Should fail",
    }),
  });
  console.log("POST /cases (staff forbidden)", staffCreate.status);

  const staffDelete = await request(`/cases/${caseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  console.log("DELETE /cases (staff forbidden)", staffDelete.status);

  const deleted = await request(`/cases/${caseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("DELETE /cases (admin)", deleted.status);

  const summary = await request("/dashboard/summary", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(
    "GET /dashboard/summary",
    summary.status,
    "total=",
    summary.body?.data?.total,
    "monthly=",
    summary.body?.data?.monthly?.length,
  );

  const courtCreate = await request("/courts", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `SMOKE TEST COURT ${Date.now()}`,
      layer: "internal",
      categories: ["pending-cases", "decided-cases"],
    }),
  });
  console.log("POST /courts", courtCreate.status, courtCreate.body?.data?.id);

  const layerMismatch = await request("/cases", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNo: `IPS/BAD-LAYER-${Date.now()}`,
      caseCategory: "pending-cases",
      courtId: "federal-secretary",
      layer: "external",
      caseTitled: "Should reject layer mismatch",
    }),
  });
  console.log("POST /cases layer mismatch", layerMismatch.status);

  const duplicateNo = `IPS/DUP-${Date.now()}`;
  const firstDup = await request("/cases", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNo: duplicateNo,
      caseCategory: "pending-cases",
      courtId: "federal-secretary",
      layer: "internal",
      caseTitled: "Unique index first",
    }),
  });
  const secondDup = await request("/cases", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      caseNo: duplicateNo,
      caseCategory: "pending-cases",
      courtId: "federal-secretary",
      layer: "internal",
      caseTitled: "Unique index second",
    }),
  });
  console.log("POST /cases duplicate caseNo", firstDup.status, secondDup.status);
  if (firstDup.body?.data?.id) {
    await request(`/cases/${firstDup.body.data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  }

  // Deactivate smoke court so UI/courts list stays clean
  if (courtCreate.body?.data?.id) {
    const deactivated = await request(`/courts/${courtCreate.body.data.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isActive: false }),
    });
    console.log("PATCH /courts deactivate smoke", deactivated.status);
  }

  if (
    list.status !== 200 ||
    !list.body?.data?.length ||
    filtered.status !== 200 ||
    filtered.body?.data?.length < 1 ||
    paged.status !== 200 ||
    paged.body?.data?.items?.length !== 10 ||
    paged.body?.data?.pagination?.total < 10 ||
    created.status !== 201 ||
    patched.status !== 200 ||
    staffCreate.status !== 403 ||
    staffDelete.status !== 403 ||
    deleted.status !== 200 ||
    summary.status !== 200 ||
    summary.body?.data?.monthly?.length !== 6 ||
    !summary.body?.data?.byCourt ||
    typeof summary.body?.data?.trends?.internal !== "number" ||
    courtCreate.status !== 201 ||
    layerMismatch.status !== 400 ||
    firstDup.status !== 201 ||
    secondDup.status !== 409
  ) {
    console.error("Phase 3 cases/dashboard smoke test FAILED");
    process.exit(1);
  }

  console.log("Phase 3 cases + dashboard + court-create smoke test PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
