import { ALL_COURTS } from "@/lib/cases/courts";
import type { CaseCategory, CaseRecord, CourtLayer } from "@/lib/cases/types";

function pad(n: number, size = 3) {
  return String(n).padStart(size, "0");
}

function buildCases(): CaseRecord[] {
  const rows: CaseRecord[] = [];
  let sr = 1;

  for (const court of ALL_COURTS) {
    for (const category of court.categories) {
      const count = categoryCount(court.layer, category);
      for (let i = 1; i <= count; i++) {
        const decided = category === "decided-cases";
        rows.push({
          id: `${court.id}-${category}-${i}`,
          srNo: sr++,
          caseNo: `IPS/${court.layer === "internal" ? "INT" : "EXT"}/${pad(sr)}/${2024 + (i % 2)}`,
          dateOfInstitution: `2024-0${(i % 9) + 1}-${pad((i % 27) + 1, 2)}`,
          caseCategory: category,
          propertyLandDemandNo: `PLD-${pad(100 + i)}`,
          lotNo: `LOT-${pad(i)}`,
          areaMeasuring: `${(i * 3.5).toFixed(1)} Marla`,
          propertyLandStatus: i % 2 === 0 ? "Evacuee Trust Property" : "Attached / Under Litigation",
          caseTitled: sampleTitle(court.name, i),
          nameOfCourt: court.name,
          courtId: court.id,
          layer: court.layer,
          nameOfCounsel: sampleCounsel(i),
          dateOfEntrustmentToCounsel: `2024-0${(i % 8) + 1}-15`,
          todayCourtProceedings: sampleProceeding(category, i),
          nextDateOfHearing: decided ? "—" : `2026-0${(i % 6) + 1}-${pad((i % 20) + 1, 2)}`,
          nextDateProceedings: decided ? "—" : "Arguments / Evidence",
          dateOfDecision: decided ? `2025-0${(i % 9) + 1}-20` : "—",
          decidedInFavourOfIps: decided ? (i % 2 === 0 ? "Yes" : "No") : "—",
          decidedAgainstIps: decided ? (i % 2 === 0 ? "No" : "Yes") : "—",
          fillingOfAppeal: decided && i % 3 === 0 ? "Yes" : "No",
          dateGistOfProceedings: sampleProceeding(category, i),
          proceedingDate: `2025-1${i % 2}-${pad((i % 25) + 1, 2)}`,
          previousDate: `2025-0${(i % 9) + 1}-10`,
          requirementForNextDateOfHearing: decided ? "—" : "File written arguments / produce record",
          feePaid: `${20000 + i * 1500}`,
          feePayable: `${5000 + (i % 4) * 2500}`,
          caseStatus: categoryStatus(category),
          stage: categoryStage(category, i),
          shortOrder: decided ? "Short order announced" : "—",
          finalOrder: decided ? "Final order placed on record" : "—",
          remarks: sampleRemarks(category, i),
        });
      }
    }
  }

  return rows;
}

function categoryCount(layer: CourtLayer, category: CaseCategory): number {
  if (layer === "external" && (category === "restraining-order" || category === "direction-cases")) {
    return 4;
  }
  if (category === "pending-cases") return 5;
  if (category === "decided-cases") return 4;
  return 3;
}

function categoryStatus(category: CaseCategory): string {
  switch (category) {
    case "decided-cases":
      return "Decided";
    case "pending-cases":
      return "Pending";
    case "restraining-order":
      return "Restraining Order";
    case "direction-cases":
      return "Direction";
  }
}

function categoryStage(category: CaseCategory, i: number): string {
  if (category === "decided-cases") return i % 2 === 0 ? "Disposed" : "Judgment";
  if (category === "pending-cases") return i % 2 === 0 ? "Evidence" : "Arguments";
  if (category === "restraining-order") return "Stay / Injunction";
  return "Compliance / Directions";
}

function sampleTitle(court: string, i: number): string {
  const titles = [
    "IPS vs Occupant — Recovery of Possession",
    "Allottee vs IPS — Lease Dispute",
    "IPS vs Encroacher — Eviction",
    "Beneficiary vs IPS — Property Claim",
    "IPS vs Trespasser — Injunction",
  ];
  return `${titles[i % titles.length]} (${court.split(" ")[0]})`;
}

function sampleCounsel(i: number): string {
  const names = [
    "Adv. Imran Ali",
    "Adv. Sara Khan",
    "Adv. Bilal Ahmed",
    "Adv. Nadia Hussain",
    "Adv. Usman Raza",
  ];
  return names[i % names.length]!;
}

function sampleProceeding(category: CaseCategory, i: number): string {
  if (category === "decided-cases") return "Matter decided; order reserved / announced";
  if (category === "restraining-order") return "Stay application heard; status quo directed";
  if (category === "direction-cases") return "Court directions issued for record production";
  return i % 2 === 0 ? "Adjourned for evidence" : "Counsel heard; next date fixed";
}

function sampleRemarks(category: CaseCategory, i: number): string {
  if (category === "pending-cases") return "Priority follow-up with counsel before next date";
  if (category === "restraining-order") return "Monitor stay order compliance";
  if (category === "direction-cases") return "Ensure departmental compliance report";
  return i % 2 === 0 ? "Appeal window under review" : "File closed pending certified copy";
}

export const mockCases: CaseRecord[] = buildCases();

export function getCasesForCourtCategory(courtId: string, category: CaseCategory): CaseRecord[] {
  return mockCases.filter((c) => c.courtId === courtId && c.caseCategory === category);
}

export function countCases(courtId: string, category?: CaseCategory): number {
  return mockCases.filter(
    (c) => c.courtId === courtId && (category ? c.caseCategory === category : true),
  ).length;
}

export function countByLayer(layer: CourtLayer): number {
  return mockCases.filter((c) => c.layer === layer).length;
}

export function countByCategory(category: CaseCategory): number {
  return mockCases.filter((c) => c.caseCategory === category).length;
}

export function casesByMonth(): { month: string; internal: number; external: number }[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, idx) => ({
    month,
    internal: 8 + idx * 2 + (idx % 2),
    external: 6 + idx + (idx % 3),
  }));
}

export function categorySplitForCharts(): { name: string; value: number; key: CaseCategory }[] {
  const keys: CaseCategory[] = [
    "decided-cases",
    "pending-cases",
    "restraining-order",
    "direction-cases",
  ];
  const labels = {
    "decided-cases": "Decided",
    "pending-cases": "Pending",
    "restraining-order": "Restraining",
    "direction-cases": "Direction",
  } as const;
  return keys.map((key) => ({
    key,
    name: labels[key],
    value: countByCategory(key),
  }));
}
