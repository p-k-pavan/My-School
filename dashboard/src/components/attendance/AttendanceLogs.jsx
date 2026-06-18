import React from "react";
import { Loader2, AlertCircle, ClipboardCheck, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AttendanceStats from "./AttendanceStats";

export default function AttendanceLogs({
    isLoading,
    dailyLog,
    selectedDate,
    onEditExisting,
    onOpenMarkView,
}) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!dailyLog) {
        return (
            <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Attendance Not Marked</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    Daily attendance has not been filed for this class on {selectedDate}.
                </p>
                <Button onClick={onOpenMarkView} className="cursor-pointer">
                    <ClipboardCheck className="mr-2 h-4 w-4" /> Open Marking Sheet
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            <AttendanceStats
                totalStudents={dailyLog.totalStudents}
                presentCount={dailyLog.presentCount}
                absentCount={dailyLog.absentCount}
                lateCount={dailyLog.lateCount}
                halfDayCount={dailyLog.halfDayCount}
            />


            <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground">
                    Marked by teacher: <span className="font-bold text-foreground">{dailyLog.markedBy?.teacherName || "Admin"}</span>
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditExisting}
                    className="cursor-pointer"
                >
                    <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Attendance List
                </Button>
            </div>

            {/* Detailed List Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                                <th className="p-4 w-[100px]">Roll No</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4">Admission No</th>
                                <th className="p-4 w-[120px]">Check-in</th>
                                <th className="p-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {dailyLog.attendance.map((entry, idx) => {
                                const statusDetails = {
                                    P: { label: "Present", color: "bg-emerald-500/10 text-emerald-600" },
                                    A: { label: "Absent", color: "bg-red-500/10 text-red-600" },
                                    L: { label: "Late", color: "bg-amber-500/10 text-amber-600" },
                                    HD: { label: "Half Day", color: "bg-indigo-500/10 text-indigo-600" },
                                    H: { label: "Holiday", color: "bg-blue-500/10 text-blue-600" }
                                }[entry.status] || { label: "Unknown", color: "bg-muted text-muted-foreground" };

                                return (
                                    <tr key={idx} className="hover:bg-muted/20">
                                        <td className="p-4 font-bold text-foreground">{entry.studentId?.rollNo}</td>
                                        <td className="p-4 font-medium text-foreground">{entry.studentId?.studentName || "Deleted Student"}</td>
                                        <td className="p-4 text-muted-foreground">{entry.studentId?.admissionNo}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${statusDetails.color}`}>
                                                {statusDetails.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground italic text-xs">{entry.remarks || "--"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
