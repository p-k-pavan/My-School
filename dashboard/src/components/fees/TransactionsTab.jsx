import { useState, useEffect } from "react";
import { Download, Printer, AlertTriangle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useGetAllFeePaymentsQuery } from "@/redux/api/payment";
import { VoidPaymentDialog } from "./FeeDialogs";

export default function TransactionsTab() {
    const [methodFilter, setMethodFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchStudentId, setSearchStudentId] = useState(""); // text-search for student name/admission
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    const [openVoidDialog, setOpenVoidDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const queryParams = {
        page,
        limit: 10,
        paymentMethod: methodFilter || undefined,
        paymentStatus: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    };

    const { data: paymentsData, isLoading, refetch, isFetching } = useGetAllFeePaymentsQuery(queryParams);

    const paymentsList = paymentsData?.payments || [];
    const totalPages = paymentsData?.totalPages || 1;

    useEffect(() => {
        setPage(1);
    }, [methodFilter, statusFilter, startDate, endDate]);

    // Local client-side search since populate is completed on the backend
    const filteredPayments = paymentsList.filter((item) => {
        const studentName = item.studentId?.studentName?.toLowerCase() || "";
        const admissionNo = item.studentId?.admissionNo?.toLowerCase() || "";
        const receiptNo = item.receiptNo?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return studentName.includes(query) || admissionNo.includes(query) || receiptNo.includes(query);
    });

    const handleVoidClick = (payment) => {
        setSelectedPayment(payment);
        setOpenVoidDialog(true);
    };

    const handlePrintReceipt = (paymentId) => {
        const base = import.meta.env.VITE_API_BASE_URL;
        window.open(`${base}/payment/${paymentId}/receipt`, "_blank");
    };

    const handleExportExcel = () => {
        const base = import.meta.env.VITE_API_BASE_URL;
        const query = new URLSearchParams({
            paymentMethod: methodFilter,
            paymentStatus: statusFilter,
            startDate,
            endDate,
        }).toString();
        window.open(`${base}/payment/export/excel?${query}`, "_blank");
    };

    const getStatusClass = (status) => {
        const base = "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ";
        switch (status) {
            case "success":
                return `${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`;
            case "voided":
                return `${base} bg-destructive/10 text-destructive border-destructive/20`;
            default:
                return `${base} bg-amber-500/10 text-amber-600 border-amber-500/20`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters panel */}
            <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border">
                <div className="grid gap-3 sm:grid-cols-4 w-full">
                    {/* Method */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Payment Method</label>
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 focus:outline-none cursor-pointer font-medium"
                        >
                            <option value="">All Methods</option>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Net Banking</option>
                            <option value="cheque">Cheque</option>
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
                            <option value="success">Success</option>
                            <option value="voided">Voided</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-background cursor-pointer h-9 text-sm"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-background cursor-pointer h-9 text-sm"
                        />
                    </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student or receipt..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-background h-9 text-sm"
                        />
                    </div>
                    <Button variant="outline" onClick={handleExportExcel} className="cursor-pointer w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" /> Export Transactions
                    </Button>
                </div>
            </div>

            {isLoading || isFetching ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                        <Printer className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No transactions found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        No billing transaction receipts match the active search and filter filters.
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                                    <th className="p-3.5">Receipt No</th>
                                    <th className="p-3.5">Date</th>
                                    <th className="p-3.5">Admission No</th>
                                    <th className="p-3.5">Student Name</th>
                                    <th className="p-3.5">Amount Paid</th>
                                    <th className="p-3.5">Method</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5">Collected By</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredPayments.map((p) => (
                                    <tr key={p._id} className="hover:bg-muted/10">
                                        <td className="p-3.5 font-bold text-foreground">{p.receiptNo || p._id.slice(-6).toUpperCase()}</td>
                                        <td className="p-3.5 text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                        <td className="p-3.5 font-medium">{p.studentId?.admissionNo}</td>
                                        <td className="p-3.5 font-bold text-foreground">{p.studentId?.studentName}</td>
                                        <td className="p-3.5 font-black text-primary">Rs.{p.amount}</td>
                                        <td className="p-3.5 uppercase font-medium">{p.paymentMethod}</td>
                                        <td className="p-3.5">
                                            <span className={getStatusClass(p.paymentStatus)}>{p.paymentStatus.toUpperCase()}</span>
                                            {p.paymentStatus === "voided" && p.voidReason && (
                                                <div className="text-[9px] text-destructive italic mt-0.5 max-w-[120px] truncate" title={p.voidReason}>
                                                    Reason: {p.voidReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3.5 font-medium text-muted-foreground">{p.collectedBy?.name || "-"}</td>
                                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                            {p.paymentStatus !== "voided" && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePrintReceipt(p._id)}
                                                        className="cursor-pointer text-[10px] h-7 px-2"
                                                        title="Print PDF Receipt"
                                                    >
                                                        <Printer className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleVoidClick(p)}
                                                        className="cursor-pointer text-[10px] h-7 px-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                                                        title="Void Transaction"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer">Previous</Button>
                    <span className="text-sm font-medium text-muted-foreground px-3">Page {page} of {totalPages}</span>
                    <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer">Next</Button>
                </div>
            )}

            <VoidPaymentDialog
                open={openVoidDialog}
                onClose={() => setOpenVoidDialog(false)}
                paymentRecord={selectedPayment}
                refetch={refetch}
            />
        </div>
    );
}
