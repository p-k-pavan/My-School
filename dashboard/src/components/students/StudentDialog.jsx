import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit3, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    useGetStudentByIdQuery,
    useUpdateStudentMutation,
} from "@/redux/api/student";

import { useGetClassQuery } from "@/redux/api/class";
import { studentValidationSchema } from "@/schemas/studentSchema";

export default function StudentDialog({ open, onClose, studentId }) {
    const [formData, setFormData] = useState({
        studentName: "",
        admissionNo: "",
        classId: "",
        rollNo: "",
        dob: "",
        gender: "Male",
        bloodGroup: "",
        aadhaarNumber: "",
        academicYear: "",
        joiningDate: "",
        address: "",
    });

    const [errors, setErrors] = useState({});

    const { data: classesData, isLoading: isLoadingClasses } = useGetClassQuery(undefined, {
        skip: !open,
    });
    const classesList = classesData?.classes || [];

    const { data: studentResponse, isLoading: isLoadingFetch } = useGetStudentByIdQuery(studentId, {
        skip: !studentId || !open,
    });

    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

    const isLoading = isLoadingFetch || isLoadingClasses || isUpdating;

    const formatDateToInput = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().split("T")[0];
        } catch (err) {
            return "";
        }
    };

    useEffect(() => {
        if (open) {
            if (studentId && studentResponse) {
                const student = studentResponse.student || studentResponse;
                setFormData({
                    studentName: student.studentName || "",
                    admissionNo: student.admissionNo || "",
                    classId: typeof student.classId === "object" ? student.classId?._id : (student.classId || ""),
                    rollNo: student.rollNo !== undefined ? String(student.rollNo) : "",
                    dob: formatDateToInput(student.dob),
                    gender: student.gender || "Male",
                    bloodGroup: student.bloodGroup || "",
                    aadhaarNumber: student.aadhaarNumber || "",
                    academicYear: student.academicYear || "",
                    joiningDate: formatDateToInput(student.joiningDate),
                    address: student.address || "",
                });
            } else if (!studentId) {
                // Reset form
                setFormData({
                    studentName: "",
                    admissionNo: "",
                    classId: "",
                    rollNo: "",
                    dob: "",
                    gender: "Male",
                    bloodGroup: "",
                    aadhaarNumber: "",
                    academicYear: "",
                    joiningDate: "",
                    address: "",
                });
            }
            setErrors({});
        }
    }, [open, studentId, studentResponse]);

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const validation = studentValidationSchema.safeParse(formData);

        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });
            setErrors(fieldErrors);
            toast.error("Please resolve form validation errors");
            return;
        }

        setErrors({});

        const payload = {
            studentName: formData.studentName.trim(),
            admissionNo: formData.admissionNo.trim(),
            classId: formData.classId,
            rollNo: formData.rollNo ? Number(formData.rollNo) : undefined,
            dob: formData.dob,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup || undefined,
            aadhaarNumber: formData.aadhaarNumber.trim() || undefined,
            academicYear: formData.academicYear.trim(),
            joiningDate: formData.joiningDate,
            address: formData.address.trim() || undefined,
        };

        try {
            const response = await updateStudent({
                id: studentId,
                data: payload,
            }).unwrap();
            toast.success(response.message || "Student details updated successfully");
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update student details");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-primary" />
                        Edit Student Profile
                    </DialogTitle>
                    <DialogDescription>
                        Update the personal and academic details of the student.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingFetch ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground mt-2">Loading student profile...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 my-2">
                        {/* Section 1: Personal Information */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field invalid={!!errors.studentName}>
                                    <FieldLabel htmlFor="studentName">
                                        Student Name <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="studentName"
                                        value={formData.studentName}
                                        onChange={(e) => updateField("studentName", e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        aria-invalid={!!errors.studentName}
                                    />
                                    <FieldError>{errors.studentName}</FieldError>
                                </Field>

                                <Field invalid={!!errors.dob}>
                                    <FieldLabel htmlFor="dob">
                                        Date of Birth <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => updateField("dob", e.target.value)}
                                        aria-invalid={!!errors.dob}
                                    />
                                    <FieldError>{errors.dob}</FieldError>
                                </Field>

                                <Field invalid={!!errors.gender}>
                                    <FieldLabel htmlFor="gender">
                                        Gender <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(val) => updateField("gender", val)}
                                    >
                                        <SelectTrigger className="w-full bg-background cursor-pointer">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors.gender}</FieldError>
                                </Field>

                                <Field invalid={!!errors.bloodGroup}>
                                    <FieldLabel htmlFor="bloodGroup">Blood Group</FieldLabel>
                                    <Select
                                        value={formData.bloodGroup}
                                        onValueChange={(val) => updateField("bloodGroup", val)}
                                    >
                                        <SelectTrigger className="w-full bg-background cursor-pointer">
                                            <SelectValue placeholder="Select Blood Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors.bloodGroup}</FieldError>
                                </Field>

                                <Field invalid={!!errors.aadhaarNumber}>
                                    <FieldLabel htmlFor="aadhaarNumber">Aadhaar Number</FieldLabel>
                                    <Input
                                        id="aadhaarNumber"
                                        value={formData.aadhaarNumber}
                                        onChange={(e) => updateField("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
                                        placeholder="e.g. 123456789012"
                                        aria-invalid={!!errors.aadhaarNumber}
                                    />
                                    <FieldError>{errors.aadhaarNumber}</FieldError>
                                </Field>
                            </div>
                        </div>

                        {/* Section 2: Academic Information */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Academic Details
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field invalid={!!errors.admissionNo}>
                                    <FieldLabel htmlFor="admissionNo">
                                        Admission Number <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="admissionNo"
                                        value={formData.admissionNo}
                                        onChange={(e) => updateField("admissionNo", e.target.value)}
                                        placeholder="e.g. ADM2026001"
                                        aria-invalid={!!errors.admissionNo}
                                    />
                                    <FieldError>{errors.admissionNo}</FieldError>
                                </Field>

                                <Field invalid={!!errors.classId}>
                                    <FieldLabel htmlFor="classId">
                                        Class <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select
                                        value={formData.classId}
                                        onValueChange={(val) => updateField("classId", val)}
                                    >
                                        <SelectTrigger className="w-full bg-background cursor-pointer">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classesList.map((cls) => (
                                                <SelectItem key={cls._id} value={cls._id}>
                                                    {cls.className} {cls.section ? `(${cls.section})` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{errors.classId}</FieldError>
                                </Field>

                                <Field invalid={!!errors.rollNo}>
                                    <FieldLabel htmlFor="rollNo">Roll Number</FieldLabel>
                                    <Input
                                        id="rollNo"
                                        value={formData.rollNo}
                                        onChange={(e) => updateField("rollNo", e.target.value.replace(/\D/g, ""))}
                                        placeholder="e.g. 15"
                                        aria-invalid={!!errors.rollNo}
                                    />
                                    <FieldError>{errors.rollNo}</FieldError>
                                </Field>

                                <Field invalid={!!errors.academicYear}>
                                    <FieldLabel htmlFor="academicYear">
                                        Academic Year <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="academicYear"
                                        value={formData.academicYear}
                                        onChange={(e) => updateField("academicYear", e.target.value)}
                                        placeholder="e.g. 2026-2027"
                                        aria-invalid={!!errors.academicYear}
                                    />
                                    <FieldError>{errors.academicYear}</FieldError>
                                </Field>

                                <Field invalid={!!errors.joiningDate}>
                                    <FieldLabel htmlFor="joiningDate">
                                        Joining Date <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="joiningDate"
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e) => updateField("joiningDate", e.target.value)}
                                        aria-invalid={!!errors.joiningDate}
                                    />
                                    <FieldError>{errors.joiningDate}</FieldError>
                                </Field>
                            </div>
                        </div>

                        {/* Section 3: Contact & Address details */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pb-1 border-b border-border">
                                Address details
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <Field invalid={!!errors.address}>
                                    <FieldLabel htmlFor="address">Address</FieldLabel>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        placeholder="e.g. Flat 402, Sunshine Apartment"
                                        aria-invalid={!!errors.address}
                                    />
                                    <FieldError>{errors.address}</FieldError>
                                </Field>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="cursor-pointer"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="cursor-pointer"
                                disabled={isLoading}
                            >
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
