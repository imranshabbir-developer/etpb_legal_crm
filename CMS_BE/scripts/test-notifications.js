/**
 * Persistent notifications API smoke test.
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
  console.log("Testing notifications API at", BASE);
  const adminToken = await loginAs("admin@ips.gov.pk", "Admin@123", "admin");
  const email = `notification.test.${Date.now()}@ips.gov.pk`;
  const password = "TempPass@123";

  const created = await request("/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: "Notification Smoke User",
      email,
      password,
      role: "staff",
      status: "Active",
    }),
  });
  if (created.status !== 201 || !created.body?.data?.id) {
    throw new Error(`Notification test user creation failed: ${JSON.stringify(created.body)}`);
  }

  const userId = created.body.data.id;
  try {
    const token = await loginAs(email, password, "staff");
    const listed = await request("/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      "GET /notifications",
      listed.status,
      "items=",
      listed.body?.data?.items?.length,
      "unread=",
      listed.body?.data?.unreadCount,
    );

    const first = listed.body?.data?.items?.[0];
    if (!first?.id || listed.body?.data?.unreadCount < 1) {
      throw new Error("Expected seeded case notifications for the test user");
    }

    const marked = await request(`/notifications/${first.id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("PATCH /notifications/:id/read", marked.status, Boolean(marked.body?.data?.readAt));

    const all = await request("/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("POST /notifications/read-all", all.status, "updated=", all.body?.data?.updated);

    const finalList = await request("/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("GET /notifications final unread=", finalList.body?.data?.unreadCount);

    if (
      listed.status !== 200 ||
      marked.status !== 200 ||
      !marked.body?.data?.readAt ||
      all.status !== 200 ||
      finalList.body?.data?.unreadCount !== 0
    ) {
      throw new Error("Notifications read-state smoke checks failed");
    }
  } finally {
    await request(`/users/${userId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "Inactive" }),
    });
  }

  console.log("Notifications smoke test PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
