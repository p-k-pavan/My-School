import { z } from "zod";

export const homeworkSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters")
        .trim(),
    description: z
        .string()
        .min(1, "Description is required")
        .trim(),
    classId: z
        .string()
        .min(1, "Class is required")
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid class selection"),
    subjectId: z
        .string()
        .min(1, "Subject is required")
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid subject selection"),
    assignedDate: z
        .string()
        .min(1, "Assigned date is required"),
    dueDate: z
        .string()
        .min(1, "Due date is required"),
}).refine((data) => {
    if (data.assignedDate && data.dueDate) {
        return new Date(data.assignedDate) < new Date(data.dueDate);
    }
    return true;
}, {
    message: "Due date must be after assigned date",
    path: ["dueDate"],
});
