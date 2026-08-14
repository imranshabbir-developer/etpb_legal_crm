const { Case } = require("../../models");

function toDateOnlyParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function todayParts(now = new Date()) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function partsToKey({ year, month, day }) {
  return year * 10000 + month * 100 + day;
}

function daysBetween(fromKey, toKey) {
  const from = {
    year: Math.floor(fromKey / 10000),
    month: Math.floor((fromKey % 10000) / 100),
    day: fromKey % 100,
  };
  const to = {
    year: Math.floor(toKey / 10000),
    month: Math.floor((toKey % 10000) / 100),
    day: toKey % 100,
  };
  const a = Date.UTC(from.year, from.month - 1, from.day);
  const b = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((b - a) / 86400000);
}

function categoryType(category) {
  if (category === "restraining-order") return "restraining";
  if (category === "direction-cases") return "direction";
  if (category === "pending-cases") return "pending";
  if (category === "decided-cases") return "decided";
  return "hearing";
}

function reminderTiming(dueInDays) {
  if (dueInDays == null) return "missing";
  if (dueInDays < 0) return "overdue";
  if (dueInDays === 0) return "today";
  if (dueInDays === 1) return "tomorrow";
  if (dueInDays === 2) return "two-days";
  return "upcoming";
}

function timingLabel(dueInDays) {
  if (dueInDays == null) return "Date required";
  if (dueInDays < 0) return `${Math.abs(dueInDays)} day${dueInDays === -1 ? "" : "s"} overdue`;
  if (dueInDays === 0) return "Today";
  if (dueInDays === 1) return "Tomorrow";
  if (dueInDays === 2) return "In 2 days";
  return `In ${dueInDays} days`;
}

function isCompletedCase(row) {
  const status = String(row.caseStatus || "").trim().toLowerCase();
  return ["decided", "disposed", "closed", "completed"].some((value) => status.includes(value));
}

function buildReminder(row, type, dueInDays) {
  const timing = reminderTiming(dueInDays);
  const dueLabel = timingLabel(dueInDays);
  const titleByType = {
    overdue: `Overdue hearing — ${row.nameOfCourt}`,
    hearing: `Hearing ${dueLabel.toLowerCase()} — ${row.nameOfCourt}`,
    pending: `Next date missing — ${row.nameOfCourt}`,
    restraining: `Restraining follow-up ${dueInDays == null ? "" : dueLabel.toLowerCase()} — ${row.nameOfCourt}`,
    direction: `Direction compliance ${dueInDays == null ? "" : dueLabel.toLowerCase()} — ${row.nameOfCourt}`,
    decided: `Decided matter check — ${row.nameOfCourt}`,
  };

  const bodyByType = {
    overdue: `${row.caseNo}: ${row.caseTitled || "Case"} was due on ${row.nextDateOfHearing}. Update proceedings or next date.`,
    hearing: `${row.caseNo}: ${row.caseTitled || "Case"} — next hearing ${row.nextDateOfHearing}.`,
    pending: `${row.caseNo}: pending register has no valid next hearing date.`,
    restraining: `${row.caseNo}: restraining / stay matter needs status confirmation (${row.nextDateOfHearing || "no date"}).`,
    direction: `${row.caseNo}: direction case requires compliance notes before next date.`,
    decided: `${row.caseNo}: review decided matter for appeal / closure notes.`,
  };

  return {
    id: `${type}:${row.id}`,
    type,
    title: titleByType[type] || `Reminder — ${row.nameOfCourt}`,
    body: bodyByType[type] || `${row.caseNo}: ${row.caseTitled || "Case"}`,
    caseId: row.id,
    caseNo: row.caseNo,
    courtId: row.courtSlug,
    layer: row.layer,
    caseCategory: row.caseCategory,
    nextDateOfHearing: row.nextDateOfHearing || "",
    dueInDays: dueInDays == null ? null : dueInDays,
    timing,
    dueLabel,
  };
}

async function listReminders(query = {}) {
  // Ten-year horizon effectively means "all upcoming" while keeping validation bounded.
  const daysAhead = Math.min(3650, Math.max(1, Number(query.daysAhead || 3650)));
  const limit = Math.min(200, Math.max(1, Number(query.limit || 100)));

  const cases = await Case.findAll({
    attributes: [
      "id",
      "caseNo",
      "caseTitled",
      "caseCategory",
      "courtSlug",
      "nameOfCourt",
      "layer",
      "nextDateOfHearing",
      "caseStatus",
      "dateOfDecision",
    ],
    order: [
      ["nextDateOfHearing", "ASC"],
      ["srNo", "ASC"],
    ],
  });

  const todayKey = partsToKey(todayParts());
  const items = [];

  for (const row of cases) {
    // Completed/disposed cases are no longer operational reminder tasks.
    if (isCompletedCase(row) || toDateOnlyParts(row.dateOfDecision)) continue;

    const parts = toDateOnlyParts(row.nextDateOfHearing);
    if (parts) {
      const hearingKey = partsToKey(parts);
      const dueInDays = daysBetween(todayKey, hearingKey);

      if (dueInDays < 0) {
        items.push(buildReminder(row, "overdue", dueInDays));
        continue;
      }

      if (dueInDays <= daysAhead) {
        const typed =
          row.caseCategory === "restraining-order"
            ? "restraining"
            : row.caseCategory === "direction-cases"
              ? "direction"
              : "hearing";
        items.push(buildReminder(row, typed, dueInDays));
      }
      continue;
    }

    // No valid next date — remind for active operational categories
    if (row.caseCategory === "pending-cases") {
      items.push(buildReminder(row, "pending", null));
    } else if (row.caseCategory === "restraining-order") {
      items.push(buildReminder(row, "restraining", null));
    } else if (row.caseCategory === "direction-cases") {
      items.push(buildReminder(row, "direction", null));
    }
  }

  items.sort((a, b) => {
    // Login/dashboard should surface actionable dates first, then all other future
    // events, followed by overdue and missing-date follow-ups.
    const rank = {
      today: 0,
      tomorrow: 1,
      "two-days": 2,
      upcoming: 3,
      overdue: 4,
      missing: 5,
    };
    const ra = rank[a.timing] ?? 9;
    const rb = rank[b.timing] ?? 9;
    if (ra !== rb) return ra - rb;
    if (a.dueInDays == null && b.dueInDays == null) return a.caseNo.localeCompare(b.caseNo);
    if (a.dueInDays == null) return 1;
    if (b.dueInDays == null) return -1;
    return a.dueInDays - b.dueInDays;
  });

  const counts = {
    total: items.length,
    overdue: items.filter((r) => r.type === "overdue").length,
    hearing: items.filter((r) => r.type === "hearing").length,
    pending: items.filter((r) => r.type === "pending").length,
    restraining: items.filter((r) => r.type === "restraining").length,
    direction: items.filter((r) => r.type === "direction").length,
    today: items.filter((r) => r.timing === "today").length,
    tomorrow: items.filter((r) => r.timing === "tomorrow").length,
    inTwoDays: items.filter((r) => r.timing === "two-days").length,
    upcoming: items.filter((r) => r.timing === "upcoming").length,
  };

  return {
    daysAhead,
    counts,
    items: items.slice(0, limit),
  };
}

module.exports = {
  listReminders,
  categoryType,
};
