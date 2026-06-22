import { z } from "zod";

export const feeStructureSchema = z.object({
    academicYear: z
        .string()
        .min(1, "Academic year is required")
        .regex(/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY (e.g. 2026-2027)"),
    classLevel: z.coerce
        .number({
            required_error: "Class Level is required",
            invalid_type_error: "Class Level must be a number",
        })
        .int()
        .min(1, "Class Level must be at least 1")
        .max(10, "Class Level cannot exceed 10"),
    tuitionFee: z.coerce.number().nonnegative("Tuition fee must be a positive number").default(0),
    transportFee: z.coerce.number().nonnegative("Transport fee must be a positive number").default(0),
    examFee: z.coerce.number().nonnegative("Exam fee must be a positive number").default(0),
    libraryFee: z.coerce.number().nonnegative("Library fee must be a positive number").default(0),
    miscellaneousFee: z.coerce.number().nonnegative("Miscellaneous fee must be a positive number").default(0),
    otherFee: z.coerce.number().nonnegative("Other fee must be a positive number").default(0),
});

export const bulkGenerateSchema = z.object({
    classId: z.string().min(1, "Class is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid class selection"),
    feeStructureId: z.string().min(1, "Fee Structure is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid fee structure selection"),
    academicYear: z.string().min(1, "Academic year is required"),
    dueDate: z.string().min(1, "Due date is required"),
});

export const singleFeeSchema = z.object({
    studentId: z.string().min(1, "Student is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid student selection"),
    feeStructureId: z.string().min(1, "Fee Structure is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid fee structure selection"),
    academicYear: z.string().min(1, "Academic year is required"),
    discountAmount: z.coerce.number().nonnegative("Discount amount must be a positive number").default(0),
    dueDate: z.string().min(1, "Due date is required"),
});

export const paymentSchema = z.object({
    studentFeeId: z.string().min(1, "Fee record ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid fee record"),
    studentId: z.string().min(1, "Student ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid student"),
    amount: z.coerce.number().positive("Amount paid must be greater than zero"),
    paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer", "cheque"], {
        required_error: "Payment method is required",
    }),
    transactionId: z.string().trim().optional().or(z.literal("")),
    remarks: z.string().trim().optional().or(z.literal("")),
});
