import { useState, useEffect } from "react";
import { Plus, Download, Edit2, Trash2, BookOpen, Loader2, DollarSign, Search, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useGetAllFeesQuery, useDeleteFeeMutation } from "@/redux/api/fee";
import { useGetClassQuery } from "@/redux/api/class";
import { useGetFeeStructuresQuery } from "@/redux/api/feeStructure";
import { BulkGenerateDialog, RecordPaymentDialog, DiscountDialog } from "./FeeDialogs";

export default function StudentFeesTab() {
    const [academicYear, setAcademicYear] = useState("2026-2027");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    // Dialog control states
    const [openBulkDialog, setOpenBulkDialog] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
    const [selectedFeeRecord, setSelectedFeeRecord] = useState(null);

    // Fetch classes and fee structures
    const { data: classesData, isLoading: isClassesLoading } = useGetClassQuery();
    const { data: structuresData } = useGetFeeStructuresQuery({ academicYear });
    
    const classesList = classesData?.classes || [];
    const structuresList = structuresData?.feeStructures || [];

    // Fetch fees
    const queryParams = {
        page,
        limit: 10,
        academicYear,
        classId: selectedClassId || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
    };

    const { data: feesData, isLoading: isFeesLoading, refetch, isFetching } = useGetAllFeesQuery(queryParams);
    const [deleteFee, { isLoading: isDeleting }] = useDeleteFeeMutation();

    const feesList = feesData?.fees || [];
    const totalPages = feesData?.totalPages || 1;

    useEffect(() => {
        setPage(1);
    }, [selectedClassId, statusFilter, searchQuery, academicYear]);

    const handleRecordPayment = (fee) => {
        setSelectedFeeRecord(fee);
        setOpenPaymentDialog(true);
    };

    const handleApplyDiscount = (fee) => {
        setSelectedFeeRecord(fee);
        setOpenDiscountDialog(true);
    };

    const handleDeleteFee = async (id) => {
        if (!confirm("Are you sure you want to delete this fee record? This cannot be undone.")) return;
        try {
            const response = await deleteFee(id).unwrap();
            toast.success(response.message || "Fee record deleted successfully");
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete fee record");
            console.error(error);
        }
    };

    const handleExportExcel = () => {
        const base = import.meta.env.VITE_API_BASE_URL;
        const query = new URLSearchParams({
            academicYear,
            classId: selectedClassId,
            status: statusFilter,
        }).toString();
        window.open(`${base}/fee/export/excel?${query}`, "_blank");
    };

    const getStatusBadgeClass = (status) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ";
        switch (status) {
            case "paid":
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`;
            case "partial":
                return `${base} bg-primary/10 text-primary border-primary/20`;
            case "overdue":
                return `${base} bg-destructive/10 text-destructive border-destructive/20`;
            default:
                return `${base} bg-amber-500/10 text-amber-600 border-amber-500/20`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls panel */}
            <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border">
                <div className="grid gap-3 sm:grid-cols-4 w-full">
                    {/* Session */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Session</label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="2026-2027">2026-2027</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                    </div>

                    {/* Class Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Class Room</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer font-medium"
                            disabled={isClassesLoading}
                        >
                            <option value="">All Classes</option>
                            {classesList.map((c) => (
                                <option key={c._id} value={c._id}>Class {c.className} - {c.section}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending (Unpaid)</option>
                            <option value="partial">Partial Paid</option>
                            <option value="paid">Fully Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Name or Admission No..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 text-sm h-9 bg-background"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Actions row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <span className="text-xs text-muted-foreground font-semibold">
                        {isFeesLoading ? "Loading..." : `Found ${feesData?.total || 0} invoice records`}
                    </span>
                    <div className="flex gap-2.5 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleExportExcel} className="cursor-pointer flex-1 sm:flex-initial">
                            <Download className="mr-2 h-4 w-4" /> Export Excel
                        </Button>
                        <Button onClick={() => setOpenBulkDialog(true)} className="cursor-pointer flex-1 sm:flex-initial">
                            <Plus className="mr-2 h-4 w-4" /> Generate Class Fees
                        </Button>
                    </div>
                </div>
            </div>

            {isFeesLoading || isFetching ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : feesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <BookOpen className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No fee records found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        No billing accounts match the selected parameters. Generate fees for students to view records.
                    </p>
                    <Button onClick={() => setOpenBulkDialog(true)} className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" /> Bulk Generate Fees
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {feesList.map((fee) => (
                        <Card key={fee._id} className="border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-foreground">{fee.studentId?.studentName}</h3>
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                            <span>Adm No: <span className="font-semibold text-foreground">{fee.studentId?.admissionNo}</span></span>
                                            <span>Class: <span className="font-semibold text-foreground">{fee.studentId?.classId?.className} - {fee.studentId?.classId?.section}</span></span>
                                        </div>
                                    </div>
                                    <span className={getStatusBadgeClass(fee.status)}>{fee.status.toUpperCase()}</span>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Base Fee</div>
                                        <div className="font-semibold text-foreground">Rs.{fee.totalFee}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Discount</div>
                                        <div className="font-semibold text-foreground">Rs.{fee.discountAmount}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Paid</div>
                                        <div className="font-semibold text-emerald-600">Rs.{fee.paidAmount}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Outstanding</div>
                                        <div className={`font-bold ${fee.dueAmount > 0 ? "text-destructive" : "text-emerald-600"}`}>Rs.{fee.dueAmount}</div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <div className="text-[10px] text-muted-foreground">
                                        Due Date: <span className="font-semibold text-foreground">{new Date(fee.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                                        {fee.dueAmount > 0 && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRecordPayment(fee)}
                                                    className="cursor-pointer text-xs h-8"
                                                >
                                                    <DollarSign className="h-3 w-3 mr-1" /> Pay
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleApplyDiscount(fee)}
                                                    className="cursor-pointer text-xs h-8 text-primary border-primary/20 hover:bg-primary/5"
                                                >
                                                    <Gift className="h-3 w-3 mr-1" /> Discount
                                                </Button>
                                            </>
                                        )}
                                        {fee.paidAmount === 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteFee(fee._id)}
                                                className="cursor-pointer text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isFeesLoading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer">Previous</Button>
                    <span className="text-sm font-medium text-muted-foreground px-3">Page {page} of {totalPages}</span>
                    <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer">Next</Button>
                </div>
            )}

            <BulkGenerateDialog
                open={openBulkDialog}
                onClose={() => setOpenBulkDialog(false)}
                structuresList={structuresList}
                refetch={refetch}
            />

            <RecordPaymentDialog
                open={openPaymentDialog}
                onClose={() => setOpenPaymentDialog(false)}
                feeRecord={selectedFeeRecord}
                refetch={refetch}
            />

            <DiscountDialog
                open={openDiscountDialog}
                onClose={() => setOpenDiscountDialog(false)}
                feeRecord={selectedFeeRecord}
                refetch={refetch}
            />
        </div>
    );
}
