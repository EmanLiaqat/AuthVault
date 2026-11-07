const { z } = require("zod");

const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(80, "Name cannot exceed 80 characters")
      .optional(),

    phone: z
      .string()
      .trim()
      .max(20, "Phone number cannot exceed 20 characters")
      .optional(),

    location: z
      .string()
      .trim()
      .max(100, "Location cannot exceed 100 characters")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(300, "Bio cannot exceed 300 characters")
      .optional(),

    dateOfBirth: z
      .union([
        z.string().date(),
        z.literal("")
      ])
      .optional()
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Provide at least one field to update"
    }
  );

module.exports = { updateProfileSchema };