/** IPS Legal Case Management — domain types */

export type UserRole = "super-admin" | "admin" | "staff";

export type CourtLayer = "internal" | "external";

export type CaseCategory =
  | "decided-cases"
  | "pending-cases"
  | "restraining-order"
  | "direction-cases";

export type CaseRecord = {
  id: string;
  srNo: number;
  caseNo: string;
  dateOfInstitution: string;
  caseCategory: CaseCategory;
  propertyLandDemandNo: string;
  lotNo: string;
  areaMeasuring: string;
  propertyLandStatus: string;
  caseTitled: string;
  nameOfCourt: string;
  courtId: string;
  layer: CourtLayer;
  nameOfCounsel: string;
  dateOfEntrustmentToCounsel: string;
  todayCourtProceedings: string;
  nextDateOfHearing: string;
  nextDateProceedings: string;
  dateOfDecision: string;
  decidedInFavourOfIps: string;
  decidedAgainstIps: string;
  fillingOfAppeal: string;
  dateGistOfProceedings: string;
  proceedingDate: string;
  previousDate: string;
  requirementForNextDateOfHearing: string;
  feePaid: string;
  feePayable: string;
  caseStatus: string;
  stage: string;
  shortOrder: string;
  finalOrder: string;
  remarks: string;
};

export type CourtDefinition = {
  id: string;
  name: string;
  layer: CourtLayer;
  categories: CaseCategory[];
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive";
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName?: string;
  permissions?: string[];
};
