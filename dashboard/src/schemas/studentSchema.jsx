import { z } from "zod";

export const studentValidationSchema = z.object({
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
  rollNo: z
    .string()
    .refine((val) => val === "" || /^\d+$/.test(val), {
      message: "Roll number must be a valid positive number",
    })
    .optional()
    .or(z.literal("")),
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
  address: z.string().optional().or(z.literal("")),
  joiningDate: z
    .string()
    .min(1, "Joining date is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Joining date must be a valid date"),
});
