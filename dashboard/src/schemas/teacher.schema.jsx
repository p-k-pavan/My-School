import { z } from "zod";

export const teacherSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .trim(),
  teacherName: z
    .string()
    .min(1, "Teacher name is required")
    .min(2, "Teacher name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Teacher name must only contain letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim(),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  qualification: z
    .string()
    .min(1, "Qualification is required")
    .trim(),
  joiningDate: z
    .string()
    .min(1, "Joining date is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Joining date must be a valid date"),
});
