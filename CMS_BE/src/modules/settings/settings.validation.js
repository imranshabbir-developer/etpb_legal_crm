const { z } = require("zod");

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    email: z.string().trim().email().max(180).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const updateModulesSchema = z.object({
  showInternalModule: z.boolean(),
  showExternalModule: z.boolean(),
  showChartsModule: z.boolean(),
});

module.exports = {
  updateProfileSchema,
  updateModulesSchema,
};
