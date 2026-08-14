const { Case } = require("../../models");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EMPTY_CATEGORY = {
  "decided-cases": 0,
  "pending-cases": 0,
  "restraining-order": 0,
  "direction-cases": 0,
};

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

function shiftMonth(year, monthIndex, delta) {
  const absolute = year * 12 + monthIndex + delta;
  const nextYear = Math.floor(absolute / 12);
  const nextMonthIndex = ((absolute % 12) + 12) % 12;
  return { year: nextYear, monthIndex: nextMonthIndex };
}

function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function emptyMonthBucket(year, monthIndex) {
  return {
    key: monthKey(year, monthIndex),
    year,
    monthIndex,
    month: MONTH_NAMES[monthIndex],
    internal: 0,
    external: 0,
    byCategory: { ...EMPTY_CATEGORY },
    total: 0,
  };
}

async function getSummary() {
  const cases = await Case.findAll({
    attributes: [
      "id",
      "layer",
      "caseCategory",
      "courtSlug",
      "dateOfInstitution",
      "nextDateOfHearing",
    ],
  });

  const byLayer = { internal: 0, external: 0 };
  const byCategory = { ...EMPTY_CATEGORY };
  const byCourt = {};
  const monthBuckets = {};

  const now = new Date();
  const today = todayParts(now);
  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  const horizonParts = todayParts(horizon);
  const todayKey = partsToKey(today);
  const horizonKey = partsToKey(horizonParts);

  for (const row of cases) {
    if (row.layer === "internal" || row.layer === "external") {
      byLayer[row.layer] += 1;
    }
    if (byCategory[row.caseCategory] !== undefined) {
      byCategory[row.caseCategory] += 1;
    }

    const courtSlug = String(row.courtSlug || "").trim();
    if (courtSlug) {
      if (!byCourt[courtSlug]) {
        byCourt[courtSlug] = {
          total: 0,
          byCategory: { ...EMPTY_CATEGORY },
        };
      }
      byCourt[courtSlug].total += 1;
      if (byCourt[courtSlug].byCategory[row.caseCategory] !== undefined) {
        byCourt[courtSlug].byCategory[row.caseCategory] += 1;
      }
    }

    const inst = String(row.dateOfInstitution || "");
    const match = /^(\d{4})-(\d{2})/.exec(inst);
    if (match) {
      const year = Number(match[1]);
      const monthIdx = Number(match[2]) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const key = monthKey(year, monthIdx);
        if (!monthBuckets[key]) {
          monthBuckets[key] = emptyMonthBucket(year, monthIdx);
        }
        const bucket = monthBuckets[key];
        bucket.total += 1;
        if (row.layer === "internal") bucket.internal += 1;
        if (row.layer === "external") bucket.external += 1;
        if (bucket.byCategory[row.caseCategory] !== undefined) {
          bucket.byCategory[row.caseCategory] += 1;
        }
      }
    }
  }

  // Contiguous last-6-calendar-months window ending this month (DB counts only; zeros = no rows)
  const monthly = [];
  for (let i = 5; i >= 0; i -= 1) {
    const { year, monthIndex } = shiftMonth(now.getFullYear(), now.getMonth(), -i);
    const key = monthKey(year, monthIndex);
    const bucket = monthBuckets[key] || emptyMonthBucket(year, monthIndex);
    monthly.push({
      month: MONTH_NAMES[monthIndex],
      internal: bucket.internal,
      external: bucket.external,
    });
  }

  const thisMonth = monthly[monthly.length - 1] || { internal: 0, external: 0 };
  const lastMonth = monthly[monthly.length - 2] || { internal: 0, external: 0 };
  const thisKey = monthKey(now.getFullYear(), now.getMonth());
  const prev = shiftMonth(now.getFullYear(), now.getMonth(), -1);
  const prevKey = monthKey(prev.year, prev.monthIndex);
  const thisCat = (monthBuckets[thisKey] || emptyMonthBucket(now.getFullYear(), now.getMonth())).byCategory;
  const lastCat = (monthBuckets[prevKey] || emptyMonthBucket(prev.year, prev.monthIndex)).byCategory;

  const upcomingHearings = cases.filter((row) => {
    const parts = toDateOnlyParts(row.nextDateOfHearing);
    if (!parts) return false;
    const key = partsToKey(parts);
    return key >= todayKey && key <= horizonKey;
  }).length;

  return {
    total: cases.length,
    byLayer,
    byCategory,
    byCourt,
    monthly,
    upcomingHearings,
    trends: {
      internal: percentChange(thisMonth.internal, lastMonth.internal),
      external: percentChange(thisMonth.external, lastMonth.external),
      pending: percentChange(thisCat["pending-cases"], lastCat["pending-cases"]),
      decided: percentChange(thisCat["decided-cases"], lastCat["decided-cases"]),
      restraining: percentChange(thisCat["restraining-order"], lastCat["restraining-order"]),
      direction: percentChange(thisCat["direction-cases"], lastCat["direction-cases"]),
      total: percentChange(
        thisMonth.internal + thisMonth.external,
        lastMonth.internal + lastMonth.external,
      ),
    },
    categorySplit: [
      { key: "decided-cases", name: "Decided", value: byCategory["decided-cases"] },
      { key: "pending-cases", name: "Pending", value: byCategory["pending-cases"] },
      { key: "restraining-order", name: "Restraining", value: byCategory["restraining-order"] },
      { key: "direction-cases", name: "Direction", value: byCategory["direction-cases"] },
    ],
  };
}

module.exports = { getSummary };
