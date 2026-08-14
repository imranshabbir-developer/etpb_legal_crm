/**
 * Phase 2 courts API smoke test.
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

async function main() {
  console.log("Testing courts API at", BASE);

  const all = await request("/courts");
  console.log("GET /courts", all.status, "count=", all.body?.data?.length);

  const internal = await request("/courts?layer=internal");
  console.log(
    "GET /courts?layer=internal",
    internal.status,
    "count=",
    internal.body?.data?.length,
    internal.body?.data?.map((c) => c.id).join(", "),
  );

  const external = await request("/courts?layer=external");
  console.log(
    "GET /courts?layer=external",
    external.status,
    "count=",
    external.body?.data?.length,
  );

  const one = await request("/courts/federal-secretary");
  console.log(
    "GET /courts/federal-secretary",
    one.status,
    one.body?.data?.name,
    "cats=",
    one.body?.data?.categories?.length,
  );

  const missing = await request("/courts/does-not-exist");
  console.log("GET /courts/does-not-exist", missing.status, missing.body?.message);

  if (all.status !== 200 || !all.body?.data?.length || all.body.data.length < 12) {
    console.error("Expected at least 12 courts");
    process.exit(1);
  }
  if (internal.status !== 200 || !internal.body?.data?.length || internal.body.data.length < 5) {
    console.error("Expected at least 5 internal courts");
    process.exit(1);
  }
  if (external.status !== 200 || !external.body?.data?.length || external.body.data.length < 7) {
    console.error("Expected at least 7 external courts");
    process.exit(1);
  }
  if (one.status !== 200 || !one.body?.data?.categories?.includes("decided-cases")) {
    console.error("Federal Secretary categories mismatch");
    process.exit(1);
  }
  if (missing.status !== 404) {
    console.error("Missing court should 404");
    process.exit(1);
  }

  console.log("Phase 2 courts smoke test PASSED");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
