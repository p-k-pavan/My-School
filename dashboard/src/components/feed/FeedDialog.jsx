import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { PlusCircle, Edit3, Loader2, X, Upload, Search, Check } from "lucide-react";
import { feedSchema } from "@/schemas/feed.schema";

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
import { Separator } from "@/components/ui/separator";

import { useCreateFeedPostMutation, useUpdateFeedPostMutation } from "@/redux/api/feed";
import { useGetClassQuery } from "@/redux/api/class";
import { useGetAllStudentsQuery } from "@/redux/api/student";

export default function FeedDialog({ open, onClose, feedData }) {
    const isEdit = !!feedData;

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        visibility: "all",
        status: "published",
        expiresAt: "",
        isPinned: false,
    });

    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [removedAttachments, setRemovedAttachments] = useState([]);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null);

    const { data: classesData, isLoading: isClassesLoading } = useGetClassQuery(undefined, { skip: !open });
    const { data: studentsData, isLoading: isStudentsLoading } = useGetAllStudentsQuery(
        { search: studentSearch, limit: 10 },
        { skip: !open || formData.visibility !== "individual_students" }
    );

    const classesList = classesData?.classes || [];
    const studentsList = studentsData?.students || [];

    const [createFeedPost, { isLoading: isCreating }] = useCreateFeedPostMutation();
    const [updateFeedPost, { isLoading: isUpdating }] = useUpdateFeedPostMutation();

    const isLoading = isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            if (feedData) {
                let formattedExpiry = "";
                if (feedData.expiresAt) {
                    const date = new Date(feedData.expiresAt);
                    formattedExpiry = date.toISOString().split("T")[0];
                }

                setFormData({
                    title: feedData.title || "",
                    description: feedData.description || "",
                    visibility: feedData.visibility || "all",
                    status: feedData.status || "published",
                    expiresAt: formattedExpiry,
                    isPinned: !!feedData.isPinned,
                });

                setSelectedClasses(feedData.targetClasses?.map(c => c._id || c) || []);
                setSelectedStudents(feedData.targetStudents || []);
                setExistingAttachments(feedData.attachments || []);
                setAttachments([]);
                setRemovedAttachments([]);
            } else {
                setFormData({
                    title: "",
                    description: "",
                    visibility: "all",
                    status: "published",
                    expiresAt: "",
                    isPinned: false,
                });
                setSelectedClasses([]);
                setSelectedStudents([]);
                setExistingAttachments([]);
                setAttachments([]);
                setRemovedAttachments([]);
            }
            setErrors({});
            setStudentSearch("");
        }
    }, [open, feedData]);

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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        if (attachments.length + existingAttachments.length - removedAttachments.length + selectedFiles.length > 5) {
            toast.error("A post can have at most 5 attachments");
            return;
        }

        const totalNewSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
        if (totalNewSize > 50 * 1024 * 1024) {
            toast.error("Maximum upload size is 50MB");
            return;
        }

        setAttachments((prev) => [...prev, ...selectedFiles]);
    };

    const removeNewAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (fileUrl) => {
        setRemovedAttachments((prev) => [...prev, fileUrl]);
    };

    const handleClassToggle = (classId) => {
        setSelectedClasses((prev) =>
            prev.includes(classId)
                ? prev.filter((id) => id !== classId)
                : [...prev, classId]
        );
    };

    const handleStudentToggle = (student) => {
        setSelectedStudents((prev) => {
            const exists = prev.some((s) => s._id === student._id);
            if (exists) {
                return prev.filter((s) => s._id !== student._id);
            } else {
                return [...prev, student];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationData = {
            ...formData,
            targetClasses: formData.visibility === "classes" ? selectedClasses : [],
            targetStudents: formData.visibility === "individual_students" ? selectedStudents.map(s => s._id) : [],
        };

        const validation = feedSchema.safeParse(validationData);

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

        if (formData.visibility === "classes" && selectedClasses.length === 0) {
            toast.error("Please select at least one class");
            return;
        }

        if (formData.visibility === "individual_students" && selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        setErrors({});

        const payload = new FormData();
        payload.append("title", formData.title.trim());
        payload.append("description", formData.description.trim());
        payload.append("visibility", formData.visibility);
        payload.append("status", formData.status);
        payload.append("isPinned", formData.isPinned ? "true" : "false");
        
        if (formData.expiresAt) {
            payload.append("expiresAt", new Date(formData.expiresAt).toISOString());
        } else {
            payload.append("expiresAt", "");
        }

        if (formData.visibility === "classes") {
            payload.append("targetClasses", JSON.stringify(selectedClasses));
        } else if (formData.visibility === "individual_students") {
            payload.append("targetStudents", JSON.stringify(selectedStudents.map(s => s._id)));
        }

        attachments.forEach((file) => {
            payload.append("attachments", file);
        });

        if (isEdit && removedAttachments.length > 0) {
            payload.append("removedAttachments", JSON.stringify(removedAttachments));
        }

        try {
            if (isEdit) {
                const response = await updateFeedPost({
                    feedId: feedData._id,
                    formData: payload,
                }).unwrap();
                toast.success(response.message || "Announcement updated successfully");
            } else {
                const response = await createFeedPost(payload).unwrap();
                toast.success(response.message || "Announcement created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || `Failed to ${isEdit ? "update" : "create"} announcement`);
            console.error(error);
        }
    };

    const getAttachmentFilename = (url) => {
        if (!url) return "";
        return url.split("/").pop();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-6 border border-border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                        {isEdit ? (
                            <>
                                <Edit3 className="h-4.5 w-4.5 text-primary" />
                                Edit Announcement
                            </>
                        ) : (
                            <>
                                <PlusCircle className="h-4.5 w-4.5 text-primary" />
                                Create Announcement
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        Compose your post, configure visibility targets, and attach documents.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Field>
                        <FieldLabel htmlFor="title" required>Title</FieldLabel>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Enter announcement title"
                            className="w-full bg-background"
                            disabled={isLoading}
                        />
                        {errors.title && <FieldError>{errors.title}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description" required>Description</FieldLabel>
                        <textarea
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Enter description here..."
                            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none dark:bg-input/30"
                            disabled={isLoading}
                        />
                        {errors.description && <FieldError>{errors.description}</FieldError>}
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="visibility">Visibility</FieldLabel>
                            <Select
                                value={formData.visibility}
                                onValueChange={(val) => updateField("visibility", val)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="cursor-pointer bg-background">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border border-border">
                                    <SelectItem value="all">All Parents & Staff</SelectItem>
                                    <SelectItem value="teachers">Teachers Only</SelectItem>
                                    <SelectItem value="classes">Specific Classes</SelectItem>
                                    <SelectItem value="individual_students">Specific Students</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="status">Status</FieldLabel>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => updateField("status", val)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="cursor-pointer bg-background">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border border-border">
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    {formData.visibility === "classes" && (
                        <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Target Classes
                            </h4>
                            {isClassesLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : classesList.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No classes created yet.</p>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {classesList.map((c) => {
                                        const isSelected = selectedClasses.includes(c._id);
                                        return (
                                            <button
                                                type="button"
                                                key={c._id}
                                                onClick={() => handleClassToggle(c._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-between cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                        : "bg-background border-border text-foreground hover:bg-muted/50"
                                                }`}
                                            >
                                                <span>{c.className}-{c.section}</span>
                                                {isSelected && <Check className="h-3 w-3 shrink-0 ml-1.5" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {formData.visibility === "individual_students" && (
                        <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Target Students ({selectedStudents.length} selected)
                                </h4>
                            </div>

                            {selectedStudents.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                    {selectedStudents.map((s) => (
                                        <div
                                            key={s._id}
                                            className="inline-flex items-center gap-1 bg-primary/15 border border-primary/25 text-primary px-2.5 py-0.5 rounded-lg text-[11px] font-semibold"
                                        >
                                            <span>{s.studentName} ({s.classId?.className || ""}{s.classId?.section || ""})</span>
                                            <button
                                                type="button"
                                                onClick={() => handleStudentToggle(s)}
                                                className="hover:bg-primary/20 p-0.5 rounded-full text-primary cursor-pointer"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="Search student by name or admission number..."
                                    className="pl-9 w-full bg-background"
                                />
                            </div>

                            {studentSearch.trim() && (
                                <div className="border border-border bg-background rounded-lg overflow-hidden divide-y divide-border max-h-48 overflow-y-auto">
                                    {isStudentsLoading ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : studentsList.length === 0 ? (
                                        <div className="py-4 text-center text-xs text-muted-foreground">
                                            No matching students found
                                        </div>
                                    ) : (
                                        studentsList.map((s) => {
                                            const isSelected = selectedStudents.some((val) => val._id === s._id);
                                            return (
                                                <div
                                                    key={s._id}
                                                    onClick={() => handleStudentToggle(s)}
                                                    className="flex items-center justify-between px-4 py-2 hover:bg-muted/40 transition-all cursor-pointer text-xs font-semibold"
                                                >
                                                    <div>
                                                        <p className="text-foreground">{s.studentName}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                                            Class: {s.classId?.className}-{s.classId?.section} | Adm No: {s.admissionNo}
                                                        </p>
                                                    </div>
                                                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? "bg-primary border-primary text-primary-foreground"
                                                            : "border-border bg-background"
                                                    }`}>
                                                        {isSelected && <Check className="h-2.5 w-2.5" />}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="expiresAt">Expiration Date (Optional)</FieldLabel>
                            <Input
                                id="expiresAt"
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => updateField("expiresAt", e.target.value)}
                                className="w-full bg-background"
                                disabled={isLoading}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </Field>

                        <div className="flex items-center gap-3 h-8 mt-6 pl-1 select-none">
                            <input
                                id="isPinned"
                                type="checkbox"
                                checked={formData.isPinned}
                                onChange={(e) => updateField("isPinned", e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                                disabled={isLoading}
                            />
                            <label
                                htmlFor="isPinned"
                                className="text-sm font-semibold text-foreground cursor-pointer flex items-center gap-1.5"
                            >
                                Pin Announcement at Top
                            </label>
                        </div>
                    </div>

                    <Separator className="border-border" />

                    <div className="space-y-3">
                        <FieldLabel>Attachments (Max 5, total size &lt; 50MB)</FieldLabel>
                        
                        {existingAttachments.length > 0 && (
                            <div className="space-y-1.5">
                                {existingAttachments.map((file, i) => {
                                    const isRemoved = removedAttachments.includes(file.fileUrl);
                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold transition-all ${
                                                isRemoved
                                                    ? "border-red-200 bg-red-50/10 text-red-500 opacity-60 line-through"
                                                    : "border-border bg-muted/20 text-foreground"
                                            }`}
                                        >
                                            <span className="truncate max-w-md">
                                                {file.fileName || getAttachmentFilename(file.fileUrl)}
                                            </span>
                                            {isRemoved ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => setRemovedAttachments((prev) => prev.filter((url) => url !== file.fileUrl))}
                                                    className="text-xs font-semibold text-red-500 cursor-pointer"
                                                >
                                                    Undo Delete
                                                </Button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingAttachment(file.fileUrl)}
                                                    className="p-1 rounded-full text-muted-foreground hover:text-red-500 cursor-pointer"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {attachments.length > 0 && (
                            <div className="space-y-1.5">
                                {attachments.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-semibold"
                                    >
                                        <span className="truncate max-w-md">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewAttachment(i)}
                                            className="p-1 rounded-full hover:bg-primary/10 text-primary cursor-pointer"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {attachments.length + existingAttachments.length - removedAttachments.length < 5 && (
                            <div>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col items-center justify-center border border-dashed border-border bg-background hover:bg-muted/30 hover:border-border/80 transition-all py-5 rounded-lg cursor-pointer select-none"
                                >
                                    <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
                                    <span className="text-xs font-bold text-foreground">Click to upload files</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                        Images, videos, PDFs, DOC, XLSX, PPT up to 50MB
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6">
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
                            className="cursor-pointer flex items-center gap-1"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {isEdit ? "Save Changes" : "Create Announcement"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
