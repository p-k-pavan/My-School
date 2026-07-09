import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClipboardCheck, History, TrendingUp, Loader2, Calendar } from "lucide-react";
import { useSelector } from "react-redux";

import PageHeading from "@/layout/PageHeading";
import { getLocalDateString } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import AttendanceMark from "@/components/attendance/AttendanceMark";
import AttendanceLogs from "@/components/attendance/AttendanceLogs";
import AttendanceMonthly from "@/components/attendance/AttendanceMonthly";

import { useGetClassQuery } from "@/redux/api/class";
import { useGetStudentsByClassQuery } from "@/redux/api/student";
import {
    useMarkAttendanceMutation,
    useGetAttendanceByClassQuery,
} from "@/redux/api/attendance";

export default function Attendance() {

    
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
    const [viewMode, setViewMode] = useState("mark");


    const { data: classesData, isLoading: isClassesLoading } = useGetClassQuery();
    const classesList = classesData?.classes || [];


    useEffect(() => {
        if (classesList.length > 0 && !selectedClass) {
            setSelectedClass(classesList[0]._id);
        }
    }, [classesList, selectedClass]);


    const [attendanceList, setAttendanceList] = useState([]);

    const { data: studentsData, isLoading: isStudentsLoading } = useGetStudentsByClassQuery(
        selectedClass,
        { skip: !selectedClass || (viewMode !== "mark" && viewMode !== "monthly") }
    );
    const studentsList = studentsData?.students || [];

    const { data: logsData, isLoading: isLogsLoading, refetch: refetchLogs } = useGetAttendanceByClassQuery(
        { classId: selectedClass, date: selectedDate },
        { skip: !selectedClass || viewMode !== "logs" }
    );
    const dailyLog = logsData?.attendance;


    const getMonthDateRange = (dateStr) => {
        if (!dateStr) return { startDate: "", endDate: "" };
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return { startDate: "", endDate: "" };
        const year = date.getFullYear();
        const month = date.getMonth(); 
        
        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, month + 1, 0));
        endDate.setUTCHours(23, 59, 59, 999);
        
        return {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
        };
    };

    const monthRange = getMonthDateRange(selectedDate);

    const { data: monthlyData, isLoading: isMonthlyLoading } = useGetAttendanceByClassQuery(
        {
            classId: selectedClass,
            startDate: monthRange.startDate,
            endDate: monthRange.endDate,
            includeDetails: "true",
        },
        { skip: !selectedClass || viewMode !== "monthly" }
    );
    const monthlyRecords = monthlyData?.records || [];


    const [markAttendance, { isLoading: isSubmitting }] = useMarkAttendanceMutation();

    useEffect(() => {
        if (viewMode === "mark") {
            setAttendanceList(
                studentsList.map((student) => ({
                    studentId: student._id,
                    studentName: student.studentName,
                    rollNo: student.rollNo,
                    status: "P",
                    remarks: "",
                }))
            );
        }
    }, [studentsList, viewMode]);

    
    const handleEditExisting = () => {
        if (!dailyLog) return;

        const today = getLocalDateString();

    if (selectedDate !== today) {
        toast.error("Attendance can only be edited for today's date");
        return;
    }
        const mappedLogs = dailyLog.attendance.map((entry) => ({
            studentId: entry.studentId?._id || entry.studentId,
            studentName: entry.studentId?.studentName || "Student Details",
            rollNo: entry.studentId?.rollNo || 0,
            status: entry.status,
            remarks: entry.remarks || "",
        }));
        setAttendanceList(mappedLogs);
        setViewMode("mark");
    };

    const handleSubmitAttendance = async () => {
        if (attendanceList.length === 0) {
            toast.error("No students to mark attendance for");
            return;
        }

        const payload = {
            classId: selectedClass,
            attendanceDate: selectedDate,
            attendance: attendanceList.map(({ studentId, status, remarks }) => ({
                studentId,
                status,
                remarks,
            })),
        };

        try {
            const response = await markAttendance(payload).unwrap();
            toast.success(response.message || "Attendance recorded successfully");
            setViewMode("logs");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to record attendance");
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeading
                title="Student Attendance"
                description="Manage daily check-ins, view logs, and monitor class attendance rates."
            />

            <div className="flex flex-col md:flex-row items-center justify-between bg-card p-4 rounded-xl border border-border gap-4">
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Class Level</span>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-45 bg-background">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classesList.map((cls) => (
                                    <SelectItem key={cls._id} value={cls._id}>
                                        Class {cls.className} - {cls.section}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Select Date</span>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-background w-40"
                        />
                    </div>
                </div>

                <div className="flex bg-muted p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setViewMode("mark")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === "mark" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <span className="flex items-center gap-1">
                            <ClipboardCheck className="h-3.5 w-3.5" /> Mark Check-in
                        </span>
                    </button>
                    <button
                        onClick={() => setViewMode("logs")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === "logs" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <span className="flex items-center gap-1">
                            <History className="h-3.5 w-3.5" /> Class Logs
                        </span>
                    </button>
                    <button
                        onClick={() => setViewMode("monthly")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === "monthly" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> Monthly Report
                        </span>
                    </button>
                </div>
            </div>

            {isClassesLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : !selectedClass ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
                    Please configure a class level first.
                </div>
            ) : viewMode === "mark" ? (
                <AttendanceMark
                    isLoading={isStudentsLoading}
                    attendanceList={attendanceList}
                    setAttendanceList={setAttendanceList}
                    onSubmit={handleSubmitAttendance}
                    isSubmitting={isSubmitting}
                />
            ) : viewMode === "logs" ? (
                <AttendanceLogs
                    isLoading={isLogsLoading}
                    dailyLog={dailyLog}
                    selectedDate={selectedDate}
                    onEditExisting={handleEditExisting}
                    onOpenMarkView={() => setViewMode("mark")}
                />
            ) : (

                <AttendanceMonthly
                    isLoading={isMonthlyLoading}
                    monthlyRecords={monthlyRecords}
                    studentsList={studentsList}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
}
