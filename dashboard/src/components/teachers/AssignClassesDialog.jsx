import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, X, Loader2, Plus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetClassQuery } from "@/redux/api/class";

export default function AssignClassesDialog({
    open,
    onClose,
    teacher,
    assignedClasses = [],
    isLoadingAssigned,
    onAssign,
    onRemove,
    isAssigning,
    isRemoving,
}) {
    const [selectedClassId, setSelectedClassId] = useState("");

    const { data: allClassesData, isLoading: isLoadingAllClasses } = useGetClassQuery(undefined, {
        skip: !open,
    });
    const classesList = allClassesData?.classes || [];

    const assignedIds = new Set(assignedClasses.map((cls) => cls._id));
    const availableClasses = classesList.filter((cls) => !assignedIds.has(cls._id));

    const handleAssign = async () => {
        if (!selectedClassId) {
            toast.error("Please select a class to assign");
            return;
        }
        await onAssign(selectedClassId);
        setSelectedClassId("");
    };

    const handleRemove = async (classId) => {
        await onRemove(classId);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Manage Class Assignments
                    </DialogTitle>
                    <DialogDescription>
                        Assign classes to <strong>{teacher?.teacherName}</strong> or remove current assignments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 my-2">
                    {/* Assignment Section */}
                    <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-foreground">
                            Assign New Class
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select
                                    value={selectedClassId}
                                    onValueChange={setSelectedClassId}
                                    disabled={isLoadingAllClasses || isAssigning}
                                >
                                    <SelectTrigger className="cursor-pointer bg-background">
                                        <SelectValue
                                            placeholder={
                                                isLoadingAllClasses
                                                    ? "Loading classes..."
                                                    : "Select a class"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableClasses.length === 0 ? (
                                            <div className="p-2 text-center text-xs text-muted-foreground">
                                                No new classes available
                                            </div>
                                        ) : (
                                            availableClasses.map((cls) => (
                                                <SelectItem key={cls._id} value={cls._id}>
                                                    Class {cls.className} - {cls.section}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleAssign}
                                disabled={!selectedClassId || isAssigning}
                                className="cursor-pointer"
                            >
                                {isAssigning ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-1" /> Assign
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Assigned Classes List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">
                            Currently Assigned ({assignedClasses.length})
                        </h4>

                        {isLoadingAssigned ? (
                            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Loading assignments...
                            </div>
                        ) : assignedClasses.length === 0 ? (
                            <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/20 text-xs text-muted-foreground">
                                No classes assigned to this teacher yet.
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {assignedClasses.map((cls) => (
                                    <div
                                        key={cls._id}
                                        className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card shadow-3xs"
                                    >
                                        <div className="text-sm font-medium text-foreground">
                                            Class {cls.className} - {cls.section}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => handleRemove(cls._id)}
                                            disabled={isRemoving}
                                            className="h-7 w-7 rounded-md cursor-pointer text-destructive hover:bg-destructive/10"
                                            title="Remove Class"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
