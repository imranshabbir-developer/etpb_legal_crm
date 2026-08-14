const { z } = require("zod");

const listRemindersQuerySchema = z.object({
  daysAhead: z.coerce.number().int().min(1).max(3650).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

module.exports = {
  listRemindersQuerySchema,
};
