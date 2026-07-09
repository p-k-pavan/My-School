import { useState } from "react";
import { DollarSign, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetFeeDashboardQuery, useGetDefaultersQuery } from "@/redux/api/fee";

export default function OverviewTab() {
    const [academicYear, setAcademicYear] = useState("2026-2027");

    const { data: dashboardData, isLoading: isDashboardLoading } = useGetFeeDashboardQuery({ academicYear });
    const { data: defaultersData, isLoading: isDefaultersLoading } = useGetDefaultersQuery({ academicYear, limit: 10 });

    const summary = dashboardData?.summary || {
        totalStudents: 0,
        totalExpected: 0,
        totalCollected: 0,
        totalDue: 0,
        collectionPercentage: 0,
        paidCount: 0,
        overdueCount: 0,
        partialCount: 0,
        pendingCount: 0,
    };

    const defaultersList = defaultersData?.defaulters || [];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Year Selector */}
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-semibold">Active Session</span>
                </div>
                <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="bg-background border border-border rounded-lg text-sm px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
                >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                </select>
            </div>

            {isDashboardLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid gap-4 sm:grid-cols-4">
                        <Card className="border border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Expected Billing</CardTitle>
                                <div className="p-1.5 bg-muted rounded-md border border-border">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-extrabold text-foreground tracking-tight">
                                    {formatCurrency(summary.totalExpected)}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Total invoiced student fees</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Fees Collected</CardTitle>
                                <div className="p-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    {formatCurrency(summary.totalCollected)}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[10px] text-muted-foreground">Net received deposits</p>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                        {summary.collectionPercentage}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Outstanding Balance</CardTitle>
                                <div className="p-1.5 bg-destructive/10 rounded-md border border-destructive/20">
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-extrabold text-destructive tracking-tight">
                                    {formatCurrency(summary.totalDue)}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Uncollected pending bills</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Accounts Paid</CardTitle>
                                <div className="p-1.5 bg-primary/10 rounded-md border border-primary/20">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-2xl font-extrabold text-foreground tracking-tight">
                                    {summary.paidCount} / {summary.totalStudents}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Students fully settled</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-card border border-border p-5 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-foreground">Overall Collection Progress</span>
                            <span className="font-bold text-primary">{summary.collectionPercentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/50">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${summary.collectionPercentage}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center pt-2">
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Fully Paid</div>
                                <div className="text-sm font-extrabold text-foreground">{summary.paidCount}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Partial Paid</div>
                                <div className="text-sm font-extrabold text-foreground">{summary.partialCount}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Unpaid</div>
                                <div className="text-sm font-extrabold text-foreground">{summary.pendingCount}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Overdue</div>
                                <div className="text-sm font-extrabold text-destructive">{summary.overdueCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Defaulters Table */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <h3 className="text-sm font-bold text-foreground">Top Delinquent Accounts</h3>
                            <span className="text-xs text-muted-foreground">Students with past-due balances</span>
                        </div>
                        {isDefaultersLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : defaultersList.length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No overdue fee records found. Excellent work!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                                            <th className="p-3.5">Admission No</th>
                                            <th className="p-3.5">Student Name</th>
                                            <th className="p-3.5">Class</th>
                                            <th className="p-3.5">Expected Fee</th>
                                            <th className="p-3.5">Due Amount</th>
                                            <th className="p-3.5">Due Date</th>
                                            <th className="p-3.5 text-center">Days Overdue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {defaultersList.map((d) => (
                                            <tr key={d._id} className="hover:bg-muted/10">
                                                <td className="p-3.5 font-medium">{d.studentId?.admissionNo}</td>
                                                <td className="p-3.5 font-bold text-foreground">{d.studentId?.studentName}</td>
                                                <td className="p-3.5">
                                                    Class {d.studentId?.classId?.className} - {d.studentId?.classId?.section}
                                                </td>
                                                <td className="p-3.5 font-medium">Rs.{d.totalFee - d.discountAmount}</td>
                                                <td className="p-3.5 font-bold text-destructive">Rs.{d.dueAmount}</td>
                                                <td className="p-3.5 text-muted-foreground">
                                                    {new Date(d.dueDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                                                        {d.daysOverdue} days
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
