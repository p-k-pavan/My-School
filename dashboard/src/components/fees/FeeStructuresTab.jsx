import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useGetFeeStructuresQuery, useDeleteFeeStructureMutation } from "@/redux/api/feeStructure";
import { FeeStructureDialog } from "./FeeDialogs";

export default function FeeStructuresTab() {
    const [academicYear, setAcademicYear] = useState("2026-2027");
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStructure, setSelectedStructure] = useState(null);

    const { data: structuresData, isLoading, refetch } = useGetFeeStructuresQuery({ academicYear });
    const [deleteStructure, { isLoading: isDeleting }] = useDeleteFeeStructureMutation();

    const structuresList = structuresData?.feeStructures || [];

    const handleCreateNew = () => {
        setSelectedStructure(null);
        setOpenDialog(true);
    };

    const handleEdit = (structure) => {
        setSelectedStructure(structure);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this fee structure? This cannot be undone.")) return;
        try {
            const response = await deleteStructure(id).unwrap();
            toast.success(response.message || "Fee Structure deleted successfully");
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete structure");
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Filter Session</span>
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="bg-background border border-border rounded-lg text-sm px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
                    >
                        <option value="2026-2027">2026-2027</option>
                        <option value="2025-2026">2025-2026</option>
                    </select>
                </div>
                <Button onClick={handleCreateNew} className="cursor-pointer w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Fee Structure
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : structuresList.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No structures found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Configure a fee structure to itemize tuition, transport, and exam fees for classes.
                    </p>
                    <Button onClick={handleCreateNew} className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" /> Create First Structure
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {structuresList.map((item) => (
                        <Card key={item._id} className="border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">Class Level {item.classLevel}</h3>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.academicYear} Session</span>
                                    </div>
                                    <span className="text-lg font-black text-primary">Rs.{item.totalFee}</span>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span className="text-muted-foreground">Tuition Fee:</span>
                                        <span className="font-semibold text-foreground">Rs.{item.tuitionFee}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span className="text-muted-foreground">Transport:</span>
                                        <span className="font-semibold text-foreground">Rs.{item.transportFee}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span className="text-muted-foreground">Exams:</span>
                                        <span className="font-semibold text-foreground">Rs.{item.examFee}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span className="text-muted-foreground">Library:</span>
                                        <span className="font-semibold text-foreground">Rs.{item.libraryFee}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span className="text-muted-foreground">Misc Fee:</span>
                                        <span className="font-semibold text-foreground">Rs.{item.miscellaneousFee}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span className="text-muted-foreground">Other:</span>
                                        <span className="font-semibold text-foreground">Rs.{item.otherFee}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(item)}
                                        className="cursor-pointer text-xs h-8"
                                    >
                                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(item._id)}
                                        className="cursor-pointer text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <FeeStructureDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                structureData={selectedStructure}
                refetch={refetch}
            />
        </div>
    );
}
