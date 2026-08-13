const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super-admin", "admin", "staff"]).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
});

module.exports = { loginSchema, changePasswordSchema };
