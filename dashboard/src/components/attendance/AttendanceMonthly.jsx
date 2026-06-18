import React, { useState } from "react";
import { Loader2, Calendar, TrendingUp, CheckCircle, XCircle, AlertCircle, X, HelpCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AttendanceMonthly({
    isLoading,
    monthlyRecords = [],
    studentsList = [],
    selectedDate,
}) {
    const [selectedStudent, setSelectedStudent] = useState(null);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Format Month and Year for display
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dateObj = new Date(selectedDate);
    const monthName = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    // If no records at all
    if (monthlyRecords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card py-16 text-center">
                <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No Attendance Data</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-2">
                    No attendance records were found for this class in {monthName} {year}.
                </p>
                <p className="text-xs text-muted-foreground">
                    Mark attendance first in the check-in tab for days in this month.
                </p>
            </div>
        );
    }

    // Process attendance data for each student
    const studentStats = studentsList.map((student) => {
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let halfDayCount = 0;
        let holidayCount = 0;
        let totalDays = 0;

        monthlyRecords.forEach((record) => {
            const entry = record.attendance?.find(
                (e) => (e.studentId?._id || e.studentId) === student._id
            );
            if (entry) {
                totalDays++;
                if (entry.status === "P") presentCount++;
                else if (entry.status === "A") absentCount++;
                else if (entry.status === "L") lateCount++;
                else if (entry.status === "HD") halfDayCount++;
                else if (entry.status === "H") holidayCount++;
            }
        });

        // Present weight: P=1, L=1, HD=0.5. Holidays are excluded from active school days denominator.
        const presentWeight = presentCount + lateCount + (halfDayCount * 0.5);
        const activeDays = totalDays - holidayCount;
        const attendancePercentage = activeDays > 0 ? Math.round((presentWeight / activeDays) * 100) : 0;

        return {
            ...student,
            presentCount,
            absentCount,
            lateCount,
            halfDayCount,
            holidayCount,
            totalDays,
            attendancePercentage,
        };
    });

    // Sort students by roll number
    studentStats.sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));

    // Calculate class level aggregates
    const totalDaysLogged = monthlyRecords.length;
    
    // Overall monthly class percentage (excluding holidays)
    let totalStudentDays = 0;
    let totalWeightedAttendance = 0;
    studentStats.forEach((s) => {
        totalStudentDays += (s.totalDays - s.holidayCount);
        totalWeightedAttendance += (s.presentCount + s.lateCount + (s.halfDayCount * 0.5));
    });
    
    const classAveragePercentage = totalStudentDays > 0 
        ? Math.round((totalWeightedAttendance / totalStudentDays) * 100) 
        : 0;

    const totalStudentsCount = studentsList.length;

    // Get all daily logs for the selected student in the month
    const studentHistoryLogs = selectedStudent ? monthlyRecords.map((record) => {
        const entry = record.attendance?.find(
            (e) => (e.studentId?._id || e.studentId) === selectedStudent._id
        );
        return {
            date: record.attendanceDate,
            markedBy: record.markedBy?.teacherName || "Admin",
            status: entry?.status || "Unmarked",
            remarks: entry?.remarks || ""
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-card p-4 rounded-xl border border-border gap-2">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Monthly Attendance Dashboard</h3>
                    <p className="text-xs text-muted-foreground">
                        Detailed statistics and metrics for <span className="font-semibold text-primary">{monthName} {year}</span>. Click any student's row to verify their date-by-date history.
                    </p>
                </div>
                <div className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold self-start sm:self-center">
                    Month: {monthName}
                </div>
            </div>

            {/* Aggregated stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">Class Monthly Average</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-foreground">{classAveragePercentage}%</div>
                        <p className="text-[10px] text-muted-foreground">Average attendance rate (excluding holidays)</p>
                    </CardContent>
                </Card>

                <Card className="border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">Days Logged</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-foreground">{totalDaysLogged}</div>
                        <p className="text-[10px] text-muted-foreground">Attendance sessions this month</p>
                    </CardContent>
                </Card>

                <Card className="border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground">Active Students</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-foreground">{totalStudentsCount}</div>
                        <p className="text-[10px] text-muted-foreground">Students in this class level</p>
                    </CardContent>
                </Card>
            </div>

            {/* Students List Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Student Performance Report</span>
                    <span className="text-[10px] text-muted-foreground">Click a row to view specific dates</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                                <th className="p-4 w-[80px]">Roll No</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4 text-center w-[75px]">Present</th>
                                <th className="p-4 text-center w-[75px]">Absent</th>
                                <th className="p-4 text-center w-[75px]">Late</th>
                                <th className="p-4 text-center w-[75px]">Half Day</th>
                                <th className="p-4 text-center w-[75px]">Holiday</th>
                                <th className="p-4 w-[150px]">Attendance Rate</th>
                                <th className="p-4 w-[100px] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {studentStats.map((student) => {
                                const rate = student.attendancePercentage;
                                let statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                                let statusText = "Excellent";
                                
                                if (rate < 60) {
                                    statusColor = "text-red-500 bg-red-500/10 border-red-500/20";
                                    statusText = "Critical";
                                } else if (rate < 75) {
                                    statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                                    statusText = "Moderate";
                                }

                                return (
                                    <tr 
                                        key={student._id} 
                                        onClick={() => setSelectedStudent(student)}
                                        className="hover:bg-muted/20 cursor-pointer transition-all duration-150"
                                        title="Click to view detailed date logs"
                                    >
                                        <td className="p-4 font-bold text-foreground">{student.rollNo || "--"}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <div className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                                                        {student.studentName}
                                                        <FileText className="h-3 w-3 text-muted-foreground opacity-60" />
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">Adm: {student.admissionNo || "--"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-500/5">
                                            {student.presentCount}
                                        </td>
                                        <td className="p-4 text-center font-bold text-red-600 bg-red-500/5">
                                            {student.absentCount}
                                        </td>
                                        <td className="p-4 text-center font-bold text-amber-600 bg-amber-500/5">
                                            {student.lateCount}
                                        </td>
                                        <td className="p-4 text-center font-bold text-indigo-600 bg-indigo-500/5">
                                            {student.halfDayCount}
                                        </td>
                                        <td className="p-4 text-center font-bold text-blue-600 bg-blue-500/5">
                                            {student.holidayCount}
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                    <span>{rate}%</span>
                                                    <span className="text-muted-foreground font-medium">{student.totalDays - student.holidayCount} / {student.totalDays} days</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${rate >= 75 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                                                {statusText}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student History Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{selectedStudent.studentName}</h3>
                                <p className="text-xs text-muted-foreground">
                                    Roll No: {selectedStudent.rollNo || "--"} | Admission No: {selectedStudent.admissionNo || "--"}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Quick stats grid inside modal */}
                        <div className="p-6 bg-muted/20 border-b border-border grid grid-cols-5 gap-2 text-center">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <div className="text-xs font-bold text-emerald-600">Present</div>
                                <div className="text-lg font-extrabold text-emerald-700">{selectedStudent.presentCount}</div>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <div className="text-xs font-bold text-red-600">Absent</div>
                                <div className="text-lg font-extrabold text-red-700">{selectedStudent.absentCount}</div>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <div className="text-xs font-bold text-amber-600">Late</div>
                                <div className="text-lg font-extrabold text-amber-700">{selectedStudent.lateCount}</div>
                            </div>
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <div className="text-xs font-bold text-indigo-600">Half Day</div>
                                <div className="text-lg font-extrabold text-indigo-700">{selectedStudent.halfDayCount}</div>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <div className="text-xs font-bold text-blue-600">Holiday</div>
                                <div className="text-lg font-extrabold text-blue-700">{selectedStudent.holidayCount}</div>
                            </div>
                        </div>

                        {/* Table of dates */}
                        <div className="overflow-y-auto p-6 flex-1 min-h-[250px]">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Daily Date-by-Date Logs</h4>
                            <div className="border rounded-xl overflow-hidden bg-background">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-muted border-b text-[10px] font-bold uppercase text-muted-foreground">
                                            <th className="p-3 w-[150px]">Date</th>
                                            <th className="p-3 w-[120px]">Check-in</th>
                                            <th className="p-3">Remarks / Reasons</th>
                                            <th className="p-3 w-[120px] text-right">Marked By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {studentHistoryLogs.map((log, index) => {
                                            const formattedDate = new Date(log.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric"
                                            });
                                            
                                            const statusDetails = {
                                                P: { label: "Present", color: "bg-emerald-500/10 text-emerald-600" },
                                                A: { label: "Absent", color: "bg-red-500/10 text-red-600 font-bold" },
                                                L: { label: "Late", color: "bg-amber-500/10 text-amber-600" },
                                                HD: { label: "Half Day", color: "bg-indigo-500/10 text-indigo-600" },
                                                H: { label: "Holiday", color: "bg-blue-500/10 text-blue-600" }
                                            }[log.status] || { label: log.status, color: "bg-muted text-muted-foreground" };

                                            return (
                                                <tr key={index} className="hover:bg-muted/10">
                                                    <td className="p-3 font-medium text-foreground">{formattedDate}</td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${statusDetails.color}`}>
                                                            {statusDetails.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-muted-foreground italic max-w-[200px] truncate" title={log.remarks}>
                                                        {log.remarks || "--"}
                                                    </td>
                                                    <td className="p-3 text-right text-muted-foreground">{log.markedBy}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
                            <span>Attendance Rate: <span className="font-bold text-foreground">{selectedStudent.attendancePercentage}% (excluding holidays)</span></span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedStudent(null)}
                                className="cursor-pointer text-xs"
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
