import { useState } from "react";
import { toast } from "sonner";
import { HelpCircle, Upload, FileSpreadsheet } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useBulkUploadTeacherMutation } from "@/redux/api/teacher";

export default function TeacherBulkUploadDialog({ open, onClose }) {
    const [file, setFile] = useState(null);
    const [bulkUploadTeacher, { isLoading }] = useBulkUploadTeacherMutation();

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        try {
            const response = await bulkUploadTeacher(file).unwrap();
            toast.success(response.message || "Teachers uploaded successfully");
            setFile(null);
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Bulk upload failed");
            console.error(error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
            if (["csv", "xlsx", "xls"].includes(fileExtension)) {
                setFile(selectedFile);
            } else {
                toast.error("Invalid file format. Please upload CSV or Excel files.");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary animate-bounce" />
                        Bulk Upload Teachers
                    </DialogTitle>
                    <DialogDescription>
                        Import multiple teachers at once using a CSV or Excel sheet.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center hover:bg-muted/50 transition-colors duration-300">
                        <input
                            type="file"
                            id="teacher-bulk-file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="teacher-bulk-file"
                            className="flex flex-col items-center justify-center cursor-pointer space-y-2"
                        >
                            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {file ? file.name : "Click to select or drag a file here"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Supports CSV, XLSX, XLS (Max 5MB)
                            </span>
                        </label>
                    </div>

                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                        <div className="flex gap-2">
                            <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-primary">Required File Format</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your sheet must contain the following columns:
                                </p>
                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-1 font-mono bg-background/50 p-2 rounded-md">
                                    <li>employeeId (e.g. EMP101 - unique)</li>
                                    <li>teacherName (e.g. Jane Doe)</li>
                                    <li>email (e.g. jane@school.com - unique)</li>
                                    <li>mobile (e.g. 9876543210 - unique)</li>
                                    <li>qualification (e.g. M.A, B.Ed)</li>
                                    <li>joiningDate (e.g. 2026-06-01)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-end gap-2">
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
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="cursor-pointer px-6"
                    >
                        {isLoading ? "Uploading..." : "Upload Teachers"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
