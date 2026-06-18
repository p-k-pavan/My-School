import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { subjectSchema } from "@/schemas/subject.schema";

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
import { useCreateSubjectMutation, useUpdateSubjectMutation } from "@/redux/api/subject";

export default function SubjectDialog({ open, onClose, subjectData }) {
    const isEdit = !!subjectData;

    const [formData, setFormData] = useState({
        subjectName: "",
        subjectCode: "",
        isActive: "true",
    });

    const [errors, setErrors] = useState({});

    const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
    const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (subjectData) {

                setFormData({
                    subjectName: subjectData.subjectName || "",
                    subjectCode: subjectData.subjectCode || "",
                    isActive: String(subjectData.isActive),
                });
            } else {
                setFormData({
                    subjectName: "",
                    subjectCode: "",
                    isActive: "true",
                });
            }
            setErrors({});
        }
    }, [open, subjectData]);

    const handleFieldChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = subjectSchema.safeParse(formData);

        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (!fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            });
            setErrors(fieldErrors);
            toast.error("Please fill in all required fields correctly");
            return;
        }

        const payload = {
            subjectName: formData.subjectName.trim(),
            subjectCode: formData.subjectCode.toUpperCase().trim(),
            isActive: formData.isActive === "true",
        };

        try {
            if (isEdit) {
                const response = await updateSubject({
                    id: subjectData._id,
                    formData: payload,
                }).unwrap();
                toast.success(response.message || "Subject updated successfully");
            } else {
                const response = await createSubject(payload).unwrap();
                toast.success(response.message || "Subject created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Operation failed");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Subject Details" : "Create New Subject"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure core subject details, curriculum codes, and class allocations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 my-2">
                    <Field invalid={!!errors.subjectName} className="space-y-1.5">
                        <FieldLabel htmlFor="subjectName" className="text-xs font-bold text-foreground">
                            Subject Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="subjectName"
                            placeholder="e.g. Mathematics"
                            value={formData.subjectName}
                            onChange={(e) => handleFieldChange("subjectName", e.target.value)}
                            aria-invalid={!!errors.subjectName}
                            className="bg-background"
                        />
                        <FieldError>{errors.subjectName}</FieldError>
                    </Field>

                    <Field invalid={!!errors.subjectCode} className="space-y-1.5">
                        <FieldLabel htmlFor="subjectCode" className="text-xs font-bold text-foreground">
                            Subject Code <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="subjectCode"
                            placeholder="e.g. MATH101"
                            value={formData.subjectCode}
                            onChange={(e) => handleFieldChange("subjectCode", e.target.value.toUpperCase())}
                            aria-invalid={!!errors.subjectCode}
                            className="bg-background"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Unique identifier used in timetables and transcripts.</p>
                        <FieldError>{errors.subjectCode}</FieldError>
                    </Field>

                    <Field invalid={!!errors.isActive} className="space-y-1.5">
                        <FieldLabel htmlFor="isActive" className="text-xs font-bold text-foreground">Active Status</FieldLabel>
                        <Select
                            value={formData.isActive}
                            onValueChange={(val) => handleFieldChange("isActive", val)}
                        >
                            <SelectTrigger id="isActive" className="cursor-pointer bg-background">
                                <SelectValue placeholder="Active Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Active (Offered)</SelectItem>
                                <SelectItem value="false">Inactive (Archived)</SelectItem>
                            </SelectContent>
                        </Select>
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
                                isEdit ? "Save Changes" : "Add Subject"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
