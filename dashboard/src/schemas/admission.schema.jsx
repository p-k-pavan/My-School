import { z } from "zod";

export const admissionSchema = z.object({
  // Student Information
  admissionNo: z
    .string()
    .min(1, "Admission number is required")
    .min(3, "Admission number must be at least 3 characters"),
  studentName: z
    .string()
    .min(1, "Student name is required")
    .min(2, "Student name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Student name must only contain letters and spaces"),
  classId: z
    .string()
    .min(1, "Class is required"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, "Date of birth must be a valid date in the past"),
  gender: z
    .enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a valid gender" }),
    }),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""], {
      errorMap: () => ({ message: "Please select a valid blood group" }),
    })
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z
    .string()
    .refine((val) => val === "" || /^\d{12}$/.test(val), {
      message: "Aadhaar number must be exactly 12 digits",
    })
    .optional()
    .or(z.literal("")),
  academicYear: z
    .string()
    .min(1, "Academic year is required")
    .regex(/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY (e.g. 2026-2027)"),

  // Parent Information
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

  // Contact Information
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

  // Address Information
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
