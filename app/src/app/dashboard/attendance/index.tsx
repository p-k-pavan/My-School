import { ScrollView, StatusBar, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import { Redirect } from "expo-router";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useState } from "react";
import { useGetAttendanceByStudentIdQuery } from "@/redux/api/attendance";
import { useDrawer } from "@/context/DrawerContext";
import { Ionicons } from "@expo/vector-icons";

import AttendanceHeader from "@/components/attendance/AttendanceHeader";
import MonthSelector from "@/components/attendance/MonthSelector";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import AttendanceLogs from "@/components/attendance/AttendanceLogs";

const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getCurrentMonthDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        startDate: getLocalDateString(start),
        endDate: getLocalDateString(end),
    };
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const getFormattedMonthName = (date: Date) => {
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${MONTH_NAMES[monthIndex]} ${year}`;
};

const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const dayName = DAY_NAMES[d.getDay()];
    const day = d.getDate();
    const monthName = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
};

const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate();
    const monthName = MONTH_NAMES_SHORT[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${monthName} ${year}`;
};

export default function Attendance() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        return <Redirect href="/" />;
    }

    const { openDrawer } = useDrawer();
    const isParent = (user as any)?.role === "parent";
    const parentId = isParent ? String((user as any).id) : undefined;

    const { data: parentData } = useGetParentsByUserIdQuery(parentId as string | undefined, { skip: !isParent || !parentId });

    const selectedStudentId = useAppSelector((state) => state.auth.selectedStudentId);
    const studentIds = parentData?.parent?.studentIds || [];
    const student = studentIds.find((s: any) => s._id === selectedStudentId) || studentIds[0];

    const studentId = student?._id;
    const studentName = student?.studentName ?? "Student";
    const className = student?.classId?.className
        ? `${student.classId.className}${student.classId.section ?? ""}`
        : "-";
    const rollNo = student?.rollNo ?? "-";

    const { startDate: initialStartDate, endDate: initialEndDate } = getCurrentMonthDates();
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(getLocalDateString(new Date()));
    const [activeTab, setActiveTab] = useState<"calendar" | "logs">("calendar");

    const { data, isLoading } = useGetAttendanceByStudentIdQuery({ studentId, startDate, endDate }, { skip: !studentId });

    const onMonthChange = (selectedDate: Date) => {
        const start = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1
        );
        const end = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0
        );

        setStartDate(getLocalDateString(start));
        setEndDate(getLocalDateString(end));
    };

    const handlePrevMonth = () => {
        const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(prev);
        onMonthChange(prev);
    };

    const handleNextMonth = () => {
        const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(next);
        onMonthChange(next);
    };

    const records = data?.records || [];

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let holidayCount = 0;

    const recordsMap = new Map<string, any>();
    records.forEach((record: any) => {
        if (record.attendanceDate) {
            const dateStr = record.attendanceDate.split("T")[0];
            recordsMap.set(dateStr, record);

            if (record.status === "P") presentCount++;
            else if (record.status === "A") absentCount++;
            else if (record.status === "L") lateCount++;
            else if (record.status === "HD") halfDayCount++;
            else if (record.status === "H") holidayCount++;
        }
    });

    const totalMarkedDays = presentCount + absentCount + lateCount + halfDayCount;
    const attendancePercentage = totalMarkedDays > 0
        ? (((presentCount + lateCount + (halfDayCount * 0.5)) / totalMarkedDays) * 100).toFixed(1)
        : "0.0";

    const formattedMonthName = getFormattedMonthName(currentDate);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells: { dayNum: number | null; dateStr: string | null; dayOfWeek: number }[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarCells.push({ dayNum: null, dateStr: null, dayOfWeek: i });
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
        calendarCells.push({ dayNum: day, dateStr, dayOfWeek });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const selectedRecord = selectedDateStr ? recordsMap.get(selectedDateStr) : null;
    const selectedCell = calendarCells.find(c => c.dateStr === selectedDateStr);
    const selectedDayOfWeek = selectedCell?.dayOfWeek ?? null;

    if (isLoading && records.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-slate-100 items-center justify-center">
                <ActivityIndicator size="large" color="#1E88E5" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
            <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                <AttendanceHeader
                    studentName={studentName}
                    className={className}
                    rollNo={rollNo}
                    openDrawer={openDrawer}
                />

                <View className="px-3">

                    <MonthSelector
                        formattedMonthName={formattedMonthName}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />

                    <AttendanceStats
                        attendancePercentage={attendancePercentage}
                        totalMarkedDays={totalMarkedDays}
                        presentCount={presentCount}
                        absentCount={absentCount}
                        lateCount={lateCount}
                        halfDayCount={halfDayCount}
                        holidayCount={holidayCount}
                    />

                    <View className="flex-row bg-slate-200/80 rounded-xl p-1 mt-4">
                        <TouchableOpacity
                            onPress={() => setActiveTab("calendar")}
                            style={activeTab === "calendar" ? {
                                backgroundColor: "white",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 1
                            } : undefined}
                            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-1.5"
                        >
                            <Ionicons name="calendar-sharp" size={16} color={activeTab === "calendar" ? "#1E88E5" : "#64748b"} />
                            <Text
                                style={{ color: activeTab === "calendar" ? "#1e293b" : "#64748b" }}
                                className="text-[12px] font-semibold"
                            >
                                Calendar View
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab("logs")}
                            style={activeTab === "logs" ? {
                                backgroundColor: "white",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 1
                            } : undefined}
                            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-1.5"
                        >
                            <Ionicons name="list-circle" size={18} color={activeTab === "logs" ? "#1E88E5" : "#64748b"} />
                            <Text
                                style={{ color: activeTab === "logs" ? "#1e293b" : "#64748b" }}
                                className="text-[12px] font-semibold"
                            >
                                Detailed Logs
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === "calendar" ? (
                        <AttendanceCalendar
                            calendarCells={calendarCells}
                            recordsMap={recordsMap}
                            selectedDateStr={selectedDateStr}
                            setSelectedDateStr={setSelectedDateStr}
                            todayStr={todayStr}
                            selectedDayOfWeek={selectedDayOfWeek}
                            selectedRecord={selectedRecord}
                            formatSelectedDate={formatSelectedDate}
                        />
                    ) : (
                        <AttendanceLogs
                            records={records}
                            formatDateShort={formatDateShort}
                            dayNames={DAY_NAMES}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}