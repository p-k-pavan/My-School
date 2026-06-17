import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PlusCircle, Edit3, Loader2 } from "lucide-react";
import { teacherSchema } from "@/schemas/teacher.schema";

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

import { useCreateTeacherMutation, useUpdateTeacherMutation } from "@/redux/api/teacher";

export default function TeacherDialog({ open, onClose, teacherData }) {
    const isEdit = !!teacherData;

    const [formData, setFormData] = useState({
        employeeId: "",
        teacherName: "",
        email: "",
        mobile: "",
        qualification: "",
        joiningDate: "",
    });

    const [errors, setErrors] = useState({});

    const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
    const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (teacherData) {
                let dateStr = "";
                if (teacherData.joiningDate) {
                    try {
                        dateStr = new Date(teacherData.joiningDate).toISOString().split('T')[0];
                    } catch (e) {
                        dateStr = "";
                    }
                }

                setFormData({
                    employeeId: teacherData.employeeId || "",
                    teacherName: teacherData.teacherName || "",
                    email: teacherData.email || "",
                    mobile: teacherData.mobile || "",
                    qualification: teacherData.qualification || "",
                    joiningDate: dateStr,
                });
            } else {
                setFormData({
                    employeeId: "",
                    teacherName: "",
                    email: "",
                    mobile: "",
                    qualification: "",
                    joiningDate: "",
                });
            }
            setErrors({});
        }
    }, [open, teacherData]);

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

        const validation = teacherSchema.safeParse(formData);

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

        // Prepare request body.
        // For updates, the backend only takes teacherName, mobile, email, qualification, joiningDate.
        // For create, employeeId is also required.
        const payload = {
            employeeId: formData.employeeId.trim(),
            teacherName: formData.teacherName.trim(),
            email: formData.email.trim().toLowerCase(),
            mobile: formData.mobile.trim(),
            qualification: formData.qualification.trim(),
            joiningDate: formData.joiningDate,
        };

        try {
            if (isEdit) {
                // Remove employeeId from payload for update since backend doesn't update it
                const { employeeId, ...updatePayload } = payload;
                const response = await updateTeacher({
                    id: teacherData._id,
                    formData: updatePayload,
                }).unwrap();
                toast.success(response.message || "Teacher updated successfully");
            } else {
                const response = await createTeacher(payload).unwrap();
                toast.success(response.message || "Teacher created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || `Failed to ${isEdit ? "update" : "create"} teacher`);
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? (
                            <>
                                <Edit3 className="h-5 w-5 text-primary" />
                                Edit Teacher
                            </>
                        ) : (
                            <>
                                <PlusCircle className="h-5 w-5 text-primary" />
                                Add New Teacher
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the details of the existing teacher."
                            : "Create a new teacher record in the system."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <Field invalid={!!errors.employeeId}>
                        <FieldLabel htmlFor="employeeId">
                            Employee ID <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="employeeId"
                            value={formData.employeeId}
                            onChange={(e) => updateField("employeeId", e.target.value.toUpperCase())}
                            placeholder="e.g. EMP101"
                            disabled={isEdit}
                            aria-invalid={!!errors.employeeId}
                        />
                        <FieldError>{errors.employeeId}</FieldError>
                    </Field>

                    <Field invalid={!!errors.teacherName}>
                        <FieldLabel htmlFor="teacherName">
                            Teacher Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="teacherName"
                            value={formData.teacherName}
                            onChange={(e) => updateField("teacherName", e.target.value)}
                            placeholder="e.g. John Doe"
                            aria-invalid={!!errors.teacherName}
                        />
                        <FieldError>{errors.teacherName}</FieldError>
                    </Field>

                    <Field invalid={!!errors.email}>
                        <FieldLabel htmlFor="email">
                            Email <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="e.g. john.doe@school.com"
                            aria-invalid={!!errors.email}
                        />
                        <FieldError>{errors.email}</FieldError>
                    </Field>

                    <Field invalid={!!errors.mobile}>
                        <FieldLabel htmlFor="mobile">
                            Mobile Number <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="mobile"
                            value={formData.mobile}
                            onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="e.g. 9876543210"
                            aria-invalid={!!errors.mobile}
                        />
                        <FieldError>{errors.mobile}</FieldError>
                    </Field>

                    <Field invalid={!!errors.qualification}>
                        <FieldLabel htmlFor="qualification">
                            Qualification <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="qualification"
                            value={formData.qualification}
                            onChange={(e) => updateField("qualification", e.target.value)}
                            placeholder="e.g. B.Ed, M.Sc in Mathematics"
                            aria-invalid={!!errors.qualification}
                        />
                        <FieldError>{errors.qualification}</FieldError>
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
                            className="w-full text-foreground bg-background"
                        />
                        <FieldError>{errors.joiningDate}</FieldError>
                    </Field>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="cursor-pointer px-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? "Save Changes" : "Create Teacher"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
