const { z } = require("zod");

const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

module.exports = { notificationIdSchema };
