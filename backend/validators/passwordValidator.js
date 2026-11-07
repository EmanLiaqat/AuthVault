const { z } = require("zod");

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(72, "New password cannot exceed 72 characters")
});

module.exports = { changePasswordSchema };