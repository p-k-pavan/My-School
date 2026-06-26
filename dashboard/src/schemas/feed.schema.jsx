import { z } from "zod";

export const feedSchema = z.object({
    title: z.string().min(1, "Title is required").max(150, "Title can have at most 150 characters"),
    description: z.string().min(1, "Description is required"),
    visibility: z.enum(["all", "teachers", "classes", "individual_students"]),
    status: z.enum(["published", "draft"]).default("published"),
    expiresAt: z.string().nullable().optional(),
    isPinned: z.boolean().default(false),
    targetClasses: z.array(z.string()).optional(),
    targetStudents: z.array(z.string()).optional(),
});
