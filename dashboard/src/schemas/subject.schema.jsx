import { z } from "zod";

export const subjectSchema = z.object({
    subjectName: z
        .string()
        .min(1, "Subject name is required")
        .max(100, "Subject name cannot exceed 100 characters")
        .trim(),
    subjectCode: z
        .string()
        .min(1, "Subject code is required")
        .trim()
        .toUpperCase()
        .regex(/^[a-zA-Z0-9\s-]+$/, "Subject code can only contain letters, numbers, spaces, or hyphens"),
});
