const { z } = require("zod");

const CATEGORIES = [
  "decided-cases",
  "pending-cases",
  "restraining-order",
  "direction-cases",
];

const createCourtSchema = z.object({
  name: z.string().trim().min(2).max(200),
  layer: z.enum(["internal", "external"]),
  categories: z.array(z.enum(CATEGORIES)).min(1),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case")
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateCourtSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    categories: z.array(z.enum(CATEGORIES)).min(1).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const listCourtsQuerySchema = z.object({
  layer: z.enum(["internal", "external"]).optional(),
});

module.exports = {
  createCourtSchema,
  updateCourtSchema,
  listCourtsQuerySchema,
  CATEGORIES,
};
