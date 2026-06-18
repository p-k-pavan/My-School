import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AttendanceMark({
    isLoading,
    attendanceList,
    setAttendanceList,
    onSubmit,
    isSubmitting,
}) {
    const handleStatusChange = (studentId, statusValue) => {
        setAttendanceList((prev) =>
            prev.map((item) => {
                if (item.studentId === studentId) {
                    let remarks = item.remarks;
                    if (statusValue === "H" && !remarks) {
                        remarks = "School Holiday";
                    }
                    return { ...item, status: statusValue, remarks };
                }
                return item;
            })
        );
    };

    const handleRemarksChange = (studentId, remarksValue) => {
        setAttendanceList((prev) =>
            prev.map((item) =>
                item.studentId === studentId ? { ...item, remarks: remarksValue } : item
            )
        );
    };

    const handleMarkAll = (statusValue) => {
        setAttendanceList((prev) =>
            prev.map((item) => ({ ...item, status: statusValue }))
        );
    };

    const handleMarkAllHoliday = () => {
        const reason = window.prompt("Enter reason for school holiday:", "Public Holiday");
        if (reason === null) return;
        setAttendanceList((prev) =>
            prev.map((item) => ({
                ...item,
                status: "H",
                remarks: reason || "School Holiday"
            }))
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (attendanceList.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
                No students registered in this class. Set up students in the student panel first.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-card p-4 rounded-xl border border-border gap-3">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Marking Sheet</h3>
                    <p className="text-xs text-muted-foreground">
                        Select check-in status for each student. Unmarked students default to Present.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAll("P")}
                        className="cursor-pointer text-xs"
                    >
                        Mark All Present
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAll("A")}
                        className="cursor-pointer text-xs text-destructive hover:bg-destructive hover:text-white"
                    >
                        Mark All Absent
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllHoliday}
                        className="cursor-pointer text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        Mark All Holiday
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                                <th className="p-4 w-25">Roll No</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4 w-100">Status</th>
                                <th className="p-4">Remarks (optional)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {attendanceList.map((student) => (
                                <tr key={student.studentId} className="hover:bg-muted/20">
                                    <td className="p-4 font-bold text-foreground">{student.rollNo}</td>
                                    <td className="p-4 font-medium text-foreground">{student.studentName}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            {[
                                                { label: "Present", val: "P", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white" },
                                                { label: "Absent", val: "A", color: "bg-red-500/10 text-red-600 border-red-500/20 data-[state=checked]:bg-red-500 data-[state=checked]:text-white" },
                                                { label: "Late", val: "L", color: "bg-amber-500/10 text-amber-600 border-amber-500/20 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white" },
                                                { label: "Half Day", val: "HD", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white" },
                                                { label: "Holiday", val: "H", color: "bg-blue-500/10 text-blue-600 border-blue-500/20 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" }
                                            ].map((btn) => (
                                                <button
                                                    key={btn.val}
                                                    type="button"
                                                    data-state={student.status === btn.val ? "checked" : "unchecked"}
                                                    onClick={() => handleStatusChange(student.studentId, btn.val)}
                                                    className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${btn.color}`}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Input
                                            placeholder="e.g. Doctor note"
                                            value={student.remarks}
                                            onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                            className="h-8 text-xs bg-background max-w-xs"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Separator />

                <div className="p-4 bg-muted/30 flex justify-end">
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="cursor-pointer px-8"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving Sheet...
                            </>
                        ) : (
                            "Save Attendance Sheet"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
