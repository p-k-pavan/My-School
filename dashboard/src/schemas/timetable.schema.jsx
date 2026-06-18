import { z } from "zod";

const periodEntrySchema = z.object({
    periodNo: z.coerce
        .number({
            required_error: "Period number is required",
            invalid_type_error: "Period number must be a number",
        })
        .int()
        .positive()
        .min(1, "Period number must be at least 1"),
    subjectId: z
        .string()
        .min(1, "Subject is required")
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
            message: "Must select a valid Subject",
        }),
    teacherId: z
        .string()
        .min(1, "Teacher is required")
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
            message: "Must select a valid Teacher",
        }),
    startTime: z
        .string()
        .min(1, "Start time is required")
        .trim(),
    endTime: z
        .string()
        .min(1, "End time is required")
        .trim(),
});

export const timetableSchema = z.object({
    classId: z
        .string()
        .min(1, "Class is required")
        .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
            message: "Must select a valid Class",
        }),
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], {
        errorMap: () => ({ message: "Must select a valid day of the week" }),
    }),
    academicYear: z
        .string()
        .min(1, "Academic year is required")
        .trim(),
    periods: z
        .array(periodEntrySchema)
        .min(1, "At least one period must be scheduled"),
});
