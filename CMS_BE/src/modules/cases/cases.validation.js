const { z } = require("zod");

const CATEGORIES = [
  "decided-cases",
  "pending-cases",
  "restraining-order",
  "direction-cases",
];

const caseFields = {
  caseNo: z.string().trim().min(1).max(120),
  dateOfInstitution: z.string().trim().max(40).optional().default(""),
  caseCategory: z.enum(CATEGORIES),
  propertyLandDemandNo: z.string().trim().max(120).optional().default(""),
  lotNo: z.string().trim().max(80).optional().default(""),
  areaMeasuring: z.string().trim().max(120).optional().default(""),
  propertyLandStatus: z.string().trim().max(200).optional().default(""),
  caseTitled: z.string().trim().max(400).optional().default(""),
  nameOfCourt: z.string().trim().max(200).optional().default(""),
  courtId: z.string().trim().min(1).max(80),
  layer: z.enum(["internal", "external"]),
  nameOfCounsel: z.string().trim().max(200).optional().default(""),
  dateOfEntrustmentToCounsel: z.string().trim().max(40).optional().default(""),
  todayCourtProceedings: z.string().optional().default(""),
  nextDateOfHearing: z.string().trim().max(40).optional().default(""),
  nextDateProceedings: z.string().optional().default(""),
  dateOfDecision: z.string().trim().max(40).optional().default(""),
  decidedInFavourOfIps: z.string().trim().max(40).optional().default(""),
  decidedAgainstIps: z.string().trim().max(40).optional().default(""),
  fillingOfAppeal: z.string().trim().max(40).optional().default(""),
  dateGistOfProceedings: z.string().optional().default(""),
  proceedingDate: z.string().trim().max(40).optional().default(""),
  previousDate: z.string().trim().max(40).optional().default(""),
  requirementForNextDateOfHearing: z.string().optional().default(""),
  feePaid: z.string().trim().max(40).optional().default(""),
  feePayable: z.string().trim().max(40).optional().default(""),
  caseStatus: z.string().trim().max(80).optional().default(""),
  stage: z.string().trim().max(120).optional().default(""),
  shortOrder: z.string().optional().default(""),
  finalOrder: z.string().optional().default(""),
  remarks: z.string().optional().default(""),
  srNo: z.number().int().positive().optional(),
};

const createCaseSchema = z.object(caseFields);

const updateCaseSchema = z
  .object(
    Object.fromEntries(
      Object.entries(caseFields).map(([key, schema]) => [key, schema.optional()]),
    ),
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listCasesQuerySchema = z.object({
  layer: z.enum(["internal", "external"]).optional(),
  courtId: z.string().trim().min(1).max(80).optional(),
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const bulkDeleteCasesSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

const clearCategoryQuerySchema = z.object({
  courtId: z.string().trim().min(1).max(80).optional(),
  category: z.enum(CATEGORIES).optional(),
});

module.exports = {
  createCaseSchema,
  updateCaseSchema,
  listCasesQuerySchema,
  bulkDeleteCasesSchema,
  clearCategoryQuerySchema,
  CATEGORIES,
};
