const { z } = require("zod");

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  email: z.string().trim().email("Valid email is required").max(180),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["admin", "staff"]),
  status: z.enum(["Active", "Inactive"]).optional().default("Active"),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    email: z.string().trim().email().max(180).optional(),
    password: z.string().min(6).max(100).optional(),
    role: z.enum(["admin", "staff"]).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const updateStatusSchema = z.object({
  status: z.enum(["Active", "Inactive"]),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
};
