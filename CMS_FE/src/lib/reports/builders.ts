import { CASE_CATEGORY_LABELS, formatCourtLabel } from "@/lib/cases/courts";
import { ROLE_LABELS } from "@/lib/cases/permissions";
import type { CaseCategory, CaseRecord, CourtDefinition, CourtLayer, SessionUser } from "@/lib/cases/types";
import type { ReportPayload } from "@/lib/reports/types";

function stamp(user: SessionUser | null) {
  return {
    generatedBy: user?.name || "ETPB Officer",
    generatedRole: user?.role ? ROLE_LABELS[user.role] : undefined,
    asOn: new Date(),
    classification: "For Official Use Only",
  };
}

function safeName(parts: string[]) {
  return parts
    .join("_")
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

const CASE_COLUMNS = [
  { key: "srNo", header: "Sr." },
  { key: "caseNo", header: "Case No." },
  { key: "caseTitled", header: "Case Titled" },
  { key: "nameOfCourt", header: "Court / Forum" },
  { key: "caseCategory", header: "Category" },
  { key: "nameOfCounsel", header: "Counsel" },
  { key: "nextDateOfHearing", header: "Next Date" },
  { key: "caseStatus", header: "Status" },
  { key: "stage", header: "Stage" },
];

function caseRows(cases: CaseRecord[]) {
  return cases.map((c, i) => ({
    srNo: c.srNo || i + 1,
    caseNo: c.caseNo,
    caseTitled: c.caseTitled,
    nameOfCourt: formatCourtLabel(c.nameOfCourt || c.courtId),
    caseCategory: CASE_CATEGORY_LABELS[c.caseCategory] || c.caseCategory,
    nameOfCounsel: c.nameOfCounsel,
    nextDateOfHearing: c.nextDateOfHearing,
    caseStatus: c.caseStatus,
    stage: c.stage,
  }));
}

export function buildDashboardPositionReport(
  cases: CaseRecord[],
  user: SessionUser | null,
  counts: {
    internal: number;
    external: number;
    pending: number;
    decided: number;
    restraining: number;
    direction: number;
  },
): ReportPayload {
  return {
    meta: {
      title: "Consolidated Case Position Report",
      officeOrCourt: "ETPB Head Office — Legal Wing",
      fileRef: "ETPB/LGL/CRM/DASH-POS",
      ...stamp(user),
    },
    summaryLines: [
      { label: "Total cases", value: String(cases.length) },
      { label: "Internal", value: String(counts.internal) },
      { label: "External", value: String(counts.external) },
      { label: "Pending", value: String(counts.pending) },
      { label: "Decided", value: String(counts.decided) },
      { label: "Restraining Order", value: String(counts.restraining) },
      { label: "Direction Cases", value: String(counts.direction) },
    ],
    table: {
      columns: CASE_COLUMNS,
      rows: caseRows(cases),
    },
    fileBaseName: safeName(["ETPB_Case_Position", new Date().toISOString().slice(0, 10)]),
  };
}

export function buildLayerSummaryReport(
  layer: CourtLayer,
  courts: CourtDefinition[],
  cases: CaseRecord[],
  user: SessionUser | null,
): ReportPayload {
  const layerCases = cases.filter((c) => c.layer === layer);
  const rows = courts.map((court) => {
    const courtCases = layerCases.filter((c) => c.courtId === court.id);
    const byCat = (cat: CaseCategory) => courtCases.filter((c) => c.caseCategory === cat).length;
    return {
      court: formatCourtLabel(court.name),
      total: courtCases.length,
      decided: byCat("decided-cases"),
      pending: byCat("pending-cases"),
      restraining: byCat("restraining-order"),
      direction: byCat("direction-cases"),
    };
  });

  return {
    meta: {
      title: `${layer === "internal" ? "Internal" : "External"} Courts — Summary Position`,
      officeOrCourt: `ETPB — ${layer === "internal" ? "Internal Forums" : "External Courts"}`,
      fileRef: `ETPB/LGL/CRM/${layer === "internal" ? "INT" : "EXT"}-SUM`,
      ...stamp(user),
    },
    summaryLines: [
      { label: "Courts / forums", value: String(courts.length) },
      { label: "Total records", value: String(layerCases.length) },
    ],
    table: {
      columns: [
        { key: "court", header: "Court / Office" },
        { key: "total", header: "Total" },
        { key: "decided", header: "Decided" },
        { key: "pending", header: "Pending" },
        { key: "restraining", header: "Restraining" },
        { key: "direction", header: "Direction" },
      ],
      rows,
    },
    fileBaseName: safeName([
      "ETPB",
      layer === "internal" ? "Internal" : "External",
      "Summary",
      new Date().toISOString().slice(0, 10),
    ]),
  };
}

export function buildCourtCategoryRegisterReport(
  court: CourtDefinition,
  category: CaseCategory,
  rows: CaseRecord[],
  user: SessionUser | null,
): ReportPayload {
  return {
    meta: {
      title: `${CASE_CATEGORY_LABELS[category]} — Case Register`,
      officeOrCourt: formatCourtLabel(court.name),
      fileRef: `ETPB/LGL/CRM/${court.id}/${category}`.toUpperCase(),
      ...stamp(user),
    },
    summaryLines: [
      { label: "Layer", value: court.layer },
      { label: "Category", value: CASE_CATEGORY_LABELS[category] },
      { label: "Records", value: String(rows.length) },
    ],
    table: {
      columns: CASE_COLUMNS,
      rows: caseRows(rows),
    },
    fileBaseName: safeName([
      "ETPB",
      court.id,
      category,
      new Date().toISOString().slice(0, 10),
    ]),
  };
}

export function buildUserDirectoryReport(
  users: { name: string; email: string; role: string; status: string }[],
  user: SessionUser | null,
): ReportPayload {
  return {
    meta: {
      title: "User Directory & Role Assignment",
      officeOrCourt: "ETPB — System Administration",
      fileRef: "ETPB/LGL/CRM/USERS",
      ...stamp(user),
    },
    summaryLines: [
      { label: "Total users", value: String(users.length) },
      { label: "Active", value: String(users.filter((u) => u.status === "Active").length) },
    ],
    table: {
      columns: [
        { key: "sr", header: "Sr." },
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "role", header: "Role" },
        { key: "status", header: "Status" },
      ],
      rows: users.map((u, i) => ({
        sr: i + 1,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
      })),
    },
    fileBaseName: safeName(["ETPB_User_Directory", new Date().toISOString().slice(0, 10)]),
  };
}

export function buildExecutivePackReport(
  cases: CaseRecord[],
  user: SessionUser | null,
  counts: {
    internal: number;
    external: number;
    pending: number;
    decided: number;
    restraining: number;
    direction: number;
  },
): ReportPayload {
  const base = buildDashboardPositionReport(cases, user, counts);
  return {
    ...base,
    meta: {
      ...base.meta,
      title: "Executive Board Pack — Consolidated Legal Position",
      fileRef: "ETPB/LGL/CRM/EXEC-BOARD",
      classification: "Confidential — For Board / Chairman Use",
    },
    fileBaseName: safeName(["ETPB_Executive_Board_Pack", new Date().toISOString().slice(0, 10)]),
  };
}
