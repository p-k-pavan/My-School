import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PageHeading({
    title,
    description,
    showAddNew,
    showBulkUpload,
    onAddNew,
    onBulkUpload,
}) {
    return (
        <div className="flex justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {title}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {description}
                </p>
            </div>

            <div className="flex gap-6">
                {showAddNew && (
                    <Button onClick={onAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New
                    </Button>
                )}

                {showBulkUpload && (
                    <Button onClick={onBulkUpload}>
                        <Plus className="mr-2 h-4 w-4" />
                        Bulk Upload
                    </Button>
                )}
            </div>
        </div>
    );
}