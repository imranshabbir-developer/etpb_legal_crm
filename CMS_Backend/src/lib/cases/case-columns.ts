import type { CaseRecord } from "@/lib/cases/types";

/** The 30 columns IPS requires for case records */
export const CASE_COLUMNS = [
  { key: "srNo", label: "Sr. No.", short: "Sr." },
  { key: "caseNo", label: "Case No.", short: "Case No." },
  { key: "dateOfInstitution", label: "Date of Institution", short: "Institution" },
  { key: "caseCategory", label: "Case Category", short: "Category" },
  { key: "propertyLandDemandNo", label: "Property / Land Demand No.", short: "Demand No." },
  { key: "lotNo", label: "Lot No.", short: "Lot" },
  { key: "areaMeasuring", label: "Area Measuring", short: "Area" },
  { key: "propertyLandStatus", label: "Property / Land Status", short: "Land Status" },
  { key: "caseTitled", label: "Case Titled", short: "Title" },
  { key: "nameOfCourt", label: "Name of Court", short: "Court" },
  { key: "nameOfCounsel", label: "Name of Counsel", short: "Counsel" },
  { key: "dateOfEntrustmentToCounsel", label: "Date of Entrustment to Counsel", short: "Entrustment" },
  { key: "todayCourtProceedings", label: "Today Court Proceedings", short: "Today" },
  { key: "nextDateOfHearing", label: "Next Date of Hearing", short: "Next Hearing" },
  { key: "nextDateProceedings", label: "Next Date Proceedings", short: "Next Proc." },
  { key: "dateOfDecision", label: "Date of Decision", short: "Decision" },
  { key: "decidedInFavourOfIps", label: "Decided in Favour of IPS", short: "Favour" },
  { key: "decidedAgainstIps", label: "Decided Against IPS", short: "Against" },
  { key: "fillingOfAppeal", label: "Filling of Appeal", short: "Appeal" },
  { key: "dateGistOfProceedings", label: "Date / Gist of Proceedings", short: "Gist" },
  { key: "proceedingDate", label: "Proceeding Date", short: "Proc. Date" },
  { key: "previousDate", label: "Previous Date", short: "Prev. Date" },
  { key: "requirementForNextDateOfHearing", label: "Requirement For Next Date of Hearing", short: "Requirement" },
  { key: "feePaid", label: "Fee Paid", short: "Fee Paid" },
  { key: "feePayable", label: "Fee Payable", short: "Fee Payable" },
  { key: "caseStatus", label: "Case Status", short: "Status" },
  { key: "stage", label: "Stage", short: "Stage" },
  { key: "shortOrder", label: "Short Order", short: "Short Order" },
  { key: "finalOrder", label: "Final Order", short: "Final Order" },
  { key: "remarks", label: "Remarks", short: "Remarks" },
] as const satisfies ReadonlyArray<{
  key: keyof CaseRecord;
  label: string;
  short: string;
}>;

/** Columns shown in the default table viewport (rest available via horizontal scroll / detail) */
export const CASE_TABLE_PRIORITY_KEYS: (keyof CaseRecord)[] = [
  "srNo",
  "caseNo",
  "dateOfInstitution",
  "caseTitled",
  "nameOfCourt",
  "nameOfCounsel",
  "nextDateOfHearing",
  "caseStatus",
  "stage",
  "remarks",
];
