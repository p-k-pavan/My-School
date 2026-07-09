import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { homeworkSchema } from "@/schemas/homework.schema";
import { getLocalDateString } from "@/lib/utils";

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
import { useCreateHomeworkMutation, useUpdateHomeworkMutation } from "@/redux/api/homework";
import { useGetSubjectsQuery } from "@/redux/api/subject";
import { useGetClassQuery } from "@/redux/api/class";

export default function HomeworkDialog({ open, onClose, homeworkData, defaultClassId, defaultAssignedDate }) {
    const isEdit = !!homeworkData;

    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classId: "",
        subjectId: "",
        assignedDate: "",
        dueDate: "",
    });

    const [errors, setErrors] = useState({});

    const { data: classesData, isLoading: classesLoading } = useGetClassQuery();
    const { data: subjectsData, isLoading: subjectsLoading } = useGetSubjectsQuery({ limit: 100 });

    const classesList = classesData?.classes || [];
    const subjectsList = subjectsData?.subjects || [];

    const [createHomework, { isLoading: isCreating }] = useCreateHomeworkMutation();
    const [updateHomework, { isLoading: isUpdating }] = useUpdateHomeworkMutation();
    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (homeworkData) {
                const formatForInput = (dateStr) => {
                    if (!dateStr) return "";
                    return new Date(dateStr).toISOString().split("T")[0];
                };

                setFormData({
                    title: homeworkData.title || "",
                    description: homeworkData.description || "",
                    classId: homeworkData.classId?._id || homeworkData.classId || "",
                    subjectId: homeworkData.subjectId?._id || homeworkData.subjectId || "",
                    assignedDate: formatForInput(homeworkData.assignedDate),
                    dueDate: formatForInput(homeworkData.dueDate),
                });
                setExistingAttachments(homeworkData.attachments || []);
            } else {
                setFormData({
                    title: "",
                    description: "",
                    classId: defaultClassId || "",
                    subjectId: "",
                    assignedDate: defaultAssignedDate || getLocalDateString(),
                    dueDate: "",
                });
                setExistingAttachments([]);
            }
            setFiles([]);
            setErrors({});
        }
    }, [open, homeworkData, defaultClassId, defaultAssignedDate]);

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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length + existingAttachments.length > 5) {
            toast.error("You can upload a maximum of 5 attachments");
            return;
        }
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeNewFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index) => {
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = homeworkSchema.safeParse(formData);

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

        const formPayload = new FormData();
        formPayload.append("title", formData.title.trim());
        formPayload.append("description", formData.description.trim());
        formPayload.append("classId", formData.classId);
        formPayload.append("subjectId", formData.subjectId);
        formPayload.append("assignedDate", formData.assignedDate);
        formPayload.append("dueDate", formData.dueDate);

        files.forEach((file) => {
            formPayload.append("attachments", file);
        });

        try {
            if (isEdit) {
                formPayload.append("id", homeworkData._id);
                
                const response = await updateHomework(formPayload).unwrap();
                toast.success(response.message || "Homework updated successfully");
            } else {
                const response = await createHomework(formPayload).unwrap();
                toast.success(response.message || "Homework created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Operation failed");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isEdit ? "Edit Homework Assignment" : "Assign New Homework"}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Fill in the details below to assign homework to the class.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Field invalid={!!errors.classId} className="space-y-1.5 col-span-1">
                            <FieldLabel htmlFor="classId" className="text-xs font-bold text-foreground">
                                Class <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Select
                                value={formData.classId}
                                onValueChange={(val) => handleFieldChange("classId", val)}
                                disabled={classesLoading || isEdit}
                            >
                                <SelectTrigger id="classId" className="cursor-pointer bg-background">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent className="max-h-40 overflow-y-auto">
                                    {classesList.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>
                                            Class {c.className} - {c.section}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.classId}</FieldError>
                        </Field>

                        {/* Subject Field */}
                        <Field invalid={!!errors.subjectId} className="space-y-1.5 col-span-1">
                            <FieldLabel htmlFor="subjectId" className="text-xs font-bold text-foreground">
                                Subject <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Select
                                value={formData.subjectId}
                                onValueChange={(val) => handleFieldChange("subjectId", val)}
                                disabled={subjectsLoading || isEdit}
                            >
                                <SelectTrigger id="subjectId" className="cursor-pointer bg-background">
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent className="max-h-40 overflow-y-auto">
                                    {subjectsList.map((s) => (
                                        <SelectItem key={s._id} value={s._id}>
                                            {s.subjectName} ({s.subjectCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError>{errors.subjectId}</FieldError>
                        </Field>
                    </div>

                    {/* Title Field */}
                    <Field invalid={!!errors.title} className="space-y-1.5">
                        <FieldLabel htmlFor="title" className="text-xs font-bold text-foreground">
                            Title <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="title"
                            placeholder="e.g. Solve exercises 1 to 5"
                            value={formData.title}
                            onChange={(e) => handleFieldChange("title", e.target.value)}
                            className="bg-background"
                        />
                        <FieldError>{errors.title}</FieldError>
                    </Field>

                    {/* Description Field */}
                    <Field invalid={!!errors.description} className="space-y-1.5">
                        <FieldLabel htmlFor="description" className="text-xs font-bold text-foreground">
                            Description / Instructions <span className="text-destructive">*</span>
                        </FieldLabel>
                        <textarea
                            id="description"
                            placeholder="Provide details about the homework assignment, what resources to use, etc."
                            value={formData.description}
                            onChange={(e) => handleFieldChange("description", e.target.value)}
                            className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <FieldError>{errors.description}</FieldError>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Assigned Date */}
                        <Field invalid={!!errors.assignedDate} className="space-y-1.5 col-span-1">
                            <FieldLabel htmlFor="assignedDate" className="text-xs font-bold text-foreground">
                                Assigned Date <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                id="assignedDate"
                                type="date"
                                value={formData.assignedDate}
                                onChange={(e) => handleFieldChange("assignedDate", e.target.value)}
                                className="bg-background"
                            />
                            <FieldError>{errors.assignedDate}</FieldError>
                        </Field>

                        {/* Due Date */}
                        <Field invalid={!!errors.dueDate} className="space-y-1.5 col-span-1">
                            <FieldLabel htmlFor="dueDate" className="text-xs font-bold text-foreground">
                                Due Date <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                                className="bg-background"
                            />
                            <FieldError>{errors.dueDate}</FieldError>
                        </Field>
                    </div>

                    {/* Attachments Field */}
                    <div className="space-y-1.5">
                        <FieldLabel className="text-xs font-bold text-foreground">
                            Attachments (Max 5 files)
                        </FieldLabel>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">Click to upload files</span>
                            <span className="text-[10px] text-muted-foreground">PDF, JPG, PNG, DOC, MP4</span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,application/pdf,.doc,.docx,video/*"
                        />

                        {/* Render existing attachments */}
                        {existingAttachments.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Files</span>
                                <div className="grid gap-1.5">
                                    {existingAttachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="h-4 w-4 shrink-0 text-primary" />
                                                <span className="truncate font-medium">{file.fileName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeExistingAttachment(idx)}
                                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Render new selected files */}
                        {files.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Files to Upload</span>
                                <div className="grid gap-1.5">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                                                <span className="truncate font-medium">{file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(idx)}
                                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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
                                isEdit ? "Save Changes" : "Assign Homework"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
