import type { CaseCategory } from "@/lib/cases/types";

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  "decided-cases": "Decided Cases",
  "pending-cases": "Pending Cases",
  "restraining-order": "Restraining Order",
  "direction-cases": "Direction Cases",
};

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
