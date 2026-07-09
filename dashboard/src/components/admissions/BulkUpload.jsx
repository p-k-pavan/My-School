import { useState } from "react";
import { toast } from "sonner";

import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBulkUploadAdmissionMutation } from "@/redux/api/admissions";


export default function BulkUploadDialog({
open,
onClose,
}) {
const [file, setFile] =
useState(null);

const [
    bulkUploadAdmission,
    { isLoading },
] =
    useBulkUploadAdmissionMutation();

const handleUpload =
    async () => {
        if (!file) {
            toast.error(
                "Please select a file"
            );

            return;
        }

        try {
            const response =
                await bulkUploadAdmission(
                    file
                ).unwrap();

            toast.success(
                response.message ||
                    "Admissions uploaded successfully"
            );

            setFile(null);

            onClose();
        } catch (error) {
            toast.error(
                error?.data
                    ?.message ||
                    "Upload failed"
            );
        }
    };

return (
    <Dialog
        open={open}
        onOpenChange={onClose}
    >
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>
                    Bulk Upload
                    Admissions
                </DialogTitle>

                <DialogDescription>
                    Upload an
                    Excel or CSV
                    file to
                    import
                    admissions.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(
                        e
                    ) =>
                        setFile(
                            e
                                .target
                                .files?.[0]
                        )
                    }
                />

                <Button
                    className="w-full"
                    onClick={
                        handleUpload
                    }
                    disabled={
                        isLoading
                    }
                >
                    {isLoading
                        ? "Uploading..."
                        : "Upload File"}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);


}
