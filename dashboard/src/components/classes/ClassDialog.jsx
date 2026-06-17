import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PlusCircle, Edit3, Loader2 } from "lucide-react";
import { classSchema } from "@/schemas/class.schema";

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
import { useCreateClassMutation, useUpdateClassMutation } from "@/redux/api/class";
import { useGetTeachersQuery } from "@/redux/api/teacher";

export default function ClassDialog({ open, onClose, classData }) {
    const isEdit = !!classData;

    const [formData, setFormData] = useState({
        className: "",
        section: "",
        classTeacher: "",
    });

    const {
        data,
        Loading,
        error,
    } = useGetTeachersQuery();

    const teachers = data.teachers;


    const [errors, setErrors] = useState({});

    const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
    const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (classData) {

                const teacherId = typeof classData.classTeacher === "object" && classData.classTeacher !== null
                    ? classData.classTeacher._id
                    : classData.classTeacher || "";

                setFormData({
                    className: classData.className ? String(classData.className) : "",
                    section: classData.section || "",
                    classTeacher: teacherId,
                });
            } else {

                setFormData({
                    className: "",
                    section: "",
                    classTeacher: "",
                });
            }
            setErrors({});
        }
    }, [open, classData]);

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


        const validation = classSchema.safeParse(formData);

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
            className: Number(formData.className),
            section: formData.section.trim(),
            classTeacher: formData.classTeacher.trim() || null,
        };

        try {
            if (isEdit) {
                const response = await updateClass({
                    id: classData._id,
                    formData: payload,
                }).unwrap();
                toast.success(response.message || "Class updated successfully");
            } else {
                const response = await createClass(payload).unwrap();
                toast.success(response.message || "Class created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || `Failed to ${isEdit ? "update" : "create"} class`);
            console.error(error);
        }
    };

    const classOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? (
                            <>
                                <Edit3 className="h-5 w-5 text-primary" />
                                Edit Class
                            </>
                        ) : (
                            <>
                                <PlusCircle className="h-5 w-5 text-primary" />
                                Add New Class
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the details of the existing class."
                            : "Create a new class and assign a class teacher."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <Field invalid={!!errors.className}>
                        <FieldLabel htmlFor="className">
                            Class <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select
                            value={formData.className}
                            onValueChange={(val) => updateField("className", val)}
                        >
                            <SelectTrigger
                                id="className"
                                aria-invalid={!!errors.className}
                                className="cursor-pointer w-full"
                            >
                                <SelectValue placeholder="Select Class Level" />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                                {classOptions.map((num) => (
                                    <SelectItem key={num} value={num}>
                                        Class {num}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError>{errors.className}</FieldError>
                    </Field>

                    <Field invalid={!!errors.section}>
                        <FieldLabel htmlFor="section">
                            Section <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="section"
                            value={formData.section}
                            onChange={(e) => updateField("section", e.target.value.toUpperCase())}
                            placeholder="e.g. A"
                            aria-invalid={!!errors.section}
                        />
                        <FieldError>{errors.section}</FieldError>
                    </Field>

                    <Field invalid={!!errors.classTeacher}>
                        <FieldLabel htmlFor="classTeacher">
                            Class Teacher
                        </FieldLabel>

                        <Select
                            value={formData.classTeacher}
                            onValueChange={(value) =>
                                updateField("classTeacher", value)}
                        >
                            <SelectTrigger
                                aria-invalid={!!errors.classTeacher}
                            >
                                <SelectValue placeholder="Select Class Teacher" />
                            </SelectTrigger>

                            <SelectContent>
                                {teachers?.map((teacher) => (
                                    <SelectItem
                                        key={teacher._id}
                                        value={teacher._id}
                                    >
                                        {teacher.teacherName}
                                    </SelectItem>
                                )
                                )}
                            </SelectContent>
                        </Select>

                        <FieldError>
                            {errors.classTeacher}
                        </FieldError>
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
                                isEdit ? "Save Changes" : "Create Class"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
