import { z } from "zod";

export const classSchema = z.object({
  className: z.coerce
    .number({
      required_error: "Class name is required",
      invalid_type_error: "Class name must be a number",
    })
    .int("Class name must be an integer")
    .positive("Class name must be a positive number")
    .min(1, "Class name must be at least 1"),
  section: z
    .string()
    .min(1, "Section is required")
    .trim()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Section can only contain letters, numbers, spaces, or hyphens"),
  classTeacher: z
    .string()
    .trim()
    .refine((val) => val === "" || /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Class Teacher must be a valid 24-character MongoDB ObjectId",
    })
    .optional()
    .or(z.literal("")),
});
