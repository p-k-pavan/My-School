import { z } from "zod";

export  const parentValidationSchema = z.object({
    fatherName: z
        .string()
        .min(1, "Father's name is required")
        .min(2, "Father's name must be at least 2 characters")
        .regex(/^[a-zA-Z\s]+$/, "Father's name must only contain letters and spaces"),
    motherName: z
        .string()
        .min(1, "Mother's name is required")
        .min(2, "Mother's name must be at least 2 characters")
        .regex(/^[a-zA-Z\s]+$/, "Mother's name must only contain letters and spaces"),
    fatherOccupation: z.string().optional().or(z.literal("")),
    motherOccupation: z.string().optional().or(z.literal("")),
    annualIncome: z
        .string()
        .refine((val) => val === "" || /^\d+$/.test(val), {
            message: "Annual income must be a valid positive number",
        })
        .optional()
        .or(z.literal("")),
    guardianName: z.string().optional().or(z.literal("")),
    guardianRelation: z.string().optional().or(z.literal("")),
    phoneNumber: z
        .string()
        .min(1, "Phone number is required")
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    alternatePhoneNumber: z
        .string()
        .refine((val) => val === "" || /^\d{10}$/.test(val), {
            message: "Alternate phone number must be exactly 10 digits",
        })
        .optional()
        .or(z.literal("")),
    email: z
        .string()
        .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
            message: "Please enter a valid email address",
        })
        .optional()
        .or(z.literal("")),
    address: z
        .string()
        .min(1, "Address is required")
        .min(5, "Address must be at least 5 characters"),
    city: z
        .string()
        .min(1, "City is required")
        .min(2, "City name must be at least 2 characters"),
    state: z
        .string()
        .min(1, "State is required")
        .min(2, "State name must be at least 2 characters"),
    pincode: z
        .string()
        .min(1, "Pin code is required")
        .regex(/^\d{6}$/, "Pin code must be exactly 6 digits"),
});