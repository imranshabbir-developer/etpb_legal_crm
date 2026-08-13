import type { CaseCategory, CourtDefinition } from "@/lib/cases/types";

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  "decided-cases": "Decided Cases",
  "pending-cases": "Pending Cases",
  "restraining-order": "Restraining Order",
  "direction-cases": "Direction Cases",
};

/** Internal courts — categories as provided by IPS */
const INTERNAL_FOUR: CaseCategory[] = [
  "decided-cases",
  "pending-cases",
  "restraining-order",
  "direction-cases",
];

/** Most external courts — Restraining Order & Direction Cases only */
const EXTERNAL_TWO: CaseCategory[] = ["restraining-order", "direction-cases"];

export const INTERNAL_COURTS: CourtDefinition[] = [
  {
    id: "federal-secretary",
    name: "FEDERAL SECRETARY",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
  },
  {
    id: "joint-secretary",
    name: "JOINT SECRETARY",
    layer: "internal",
    // Provided list showed Decided twice; department standard for internal is Decided + Pending + RO + Direction
    categories: [...INTERNAL_FOUR],
  },
  {
    id: "chairman",
    name: "CHAIRMAN",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
  },
  {
    id: "administrator",
    name: "ADMINISTRATOR",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
  },
  {
    id: "assistant-deputy-administrator",
    name: "ASSISTANT / DEPUTY ADMINISTRATOR",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
  },
];

export const EXTERNAL_COURTS: CourtDefinition[] = [
  {
    id: "federal-constitutional-court",
    name: "FEDERAL CONSTITUTIONAL COURT OF PAKISTAN",
    layer: "external",
    categories: [...EXTERNAL_TWO],
  },
  {
    id: "supreme-court",
    name: "SUPREME COURT OF PAKISTAN",
    layer: "external",
    categories: [...EXTERNAL_TWO],
  },
  {
    id: "high-court",
    name: "HIGH COURT",
    layer: "external",
    categories: [...EXTERNAL_TWO],
  },
  {
    id: "district-session-court",
    name: "DISTRICT & SESSION COURT",
    layer: "external",
    categories: [...EXTERNAL_TWO],
  },
  {
    id: "civil-court",
    name: "CIVIL COURT",
    layer: "external",
    categories: [...EXTERNAL_TWO],
  },
  {
    id: "federal-service-tribunal",
    name: "FEDERAL SERVICE TRIBUNAL",
    layer: "external",
    categories: [...EXTERNAL_TWO],
  },
  {
    id: "other-courts",
    name: "OTHER COURTS",
    layer: "external",
    categories: [...INTERNAL_FOUR],
  },
];

export const ALL_COURTS: CourtDefinition[] = [...INTERNAL_COURTS, ...EXTERNAL_COURTS];

export function getCourtById(id: string): CourtDefinition | undefined {
  return ALL_COURTS.find((c) => c.id === id);
}

export function getCourtsByLayer(layer: "internal" | "external"): CourtDefinition[] {
  return layer === "internal" ? INTERNAL_COURTS : EXTERNAL_COURTS;
}

export function isValidCourtCategory(courtId: string, category: string): category is CaseCategory {
  const court = getCourtById(courtId);
  if (!court) return false;
  return court.categories.includes(category as CaseCategory);
}

/** Title-case court labels for compact UI (sidebar, dropdowns). Keeps & / separators. */
export function formatCourtLabel(name: string): string {
  const smallWords = new Set(["of", "and", "the", "a", "an", "to"]);
  return name
    .trim()
    .toLowerCase()
    .split(/(\s+|\/)/)
    .map((token, index) => {
      if (token === "/" || /^\s+$/.test(token) || token === "&") return token;
      if (index > 0 && smallWords.has(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join("");
}
