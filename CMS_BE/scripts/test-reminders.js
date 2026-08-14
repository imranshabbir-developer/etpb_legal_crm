const API_BASE = (process.env.API_BASE || "http://127.0.0.1:4000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log("Testing reminders API at", API_BASE);

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@ips.gov.pk", password: "Admin@123", role: "admin" }),
  });
  if (login.status !== 200 || !login.body?.data?.token) {
    console.error("Login failed", login.status, login.body);
    process.exit(1);
  }
  const token = login.body.data.token;

  const list = await request("/reminders?daysAhead=30&limit=200", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    "GET /reminders",
    list.status,
    "total=",
    list.body?.data?.counts?.total,
    "overdue=",
    list.body?.data?.counts?.overdue,
    "hearing=",
    list.body?.data?.counts?.hearing,
    "today=",
    list.body?.data?.counts?.today,
    "tomorrow=",
    list.body?.data?.counts?.tomorrow,
    "inTwoDays=",
    list.body?.data?.counts?.inTwoDays,
    "items=",
    list.body?.data?.items?.length,
  );

  const staffLogin = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "staff@ips.gov.pk", password: "Staff@123", role: "staff" }),
  });
  const staffToken = staffLogin.body?.data?.token;
  const staffList = await request("/reminders", {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  console.log("GET /reminders (staff)", staffList.status);

  if (
    list.status !== 200 ||
    !Array.isArray(list.body?.data?.items) ||
    typeof list.body?.data?.counts?.total !== "number" ||
    typeof list.body?.data?.counts?.tomorrow !== "number" ||
    typeof list.body?.data?.counts?.inTwoDays !== "number" ||
    staffList.status !== 200
  ) {
    console.error("Reminders smoke test FAILED");
    process.exit(1);
  }

  console.log("Reminders smoke test PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
