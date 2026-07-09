import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface StatusDetails {
    label: string;
    bg: string;
    borderColor: string;
    cellBg: string;
    text: string;
}

export const getStatusDetails = (status: string): StatusDetails => {
    switch (status) {
        case "P":
            return {
                label: "Present",
                bg: "#ecfdf5",
                borderColor: "#d1fae5",
                cellBg: "#10b981",
                text: "#065f46",
            };
        case "A":
            return {
                label: "Absent",
                bg: "#fff1f2",
                borderColor: "#ffe4e6",
                cellBg: "#f43f5e",
                text: "#9f1239",
            };
        case "L":
            return {
                label: "Late",
                bg: "#fffbeb",
                borderColor: "#fef3c7",
                cellBg: "#f59e0b",
                text: "#92400e",
            };
        case "HD":
            return {
                label: "Half Day",
                bg: "#eff6ff",
                borderColor: "#dbeafe",
                cellBg: "#3b82f6",
                text: "#1e40af",
            };
        case "H":
            return {
                label: "Holiday",
                bg: "#faf5ff",
                borderColor: "#f3e8ff",
                cellBg: "#a855f7",
                text: "#6b21a8",
            };
        default:
            return {
                label: "Not Marked",
                bg: "#f8fafc",
                borderColor: "#e2e8f0",
                cellBg: "#64748b",
                text: "#64748b",
            };
    }
};

export const getDotColor = (status?: string): string => {
    switch (status) {
        case "P": return "#10b981";
        case "A": return "#f43f5e";
        case "L": return "#f59e0b";
        case "HD": return "#3b82f6";
        case "H": return "#a855f7";
        default: return "#64748b";
    }
};

interface AttendanceCalendarProps {
    calendarCells: any[];
    recordsMap: Map<string, any>;
    selectedDateStr: string | null;
    setSelectedDateStr: (date: string | null) => void;
    todayStr: string;
    selectedDayOfWeek: number | null;
    selectedRecord: any;
    formatSelectedDate: (dateStr: string) => string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({
    calendarCells,
    recordsMap,
    selectedDateStr,
    setSelectedDateStr,
    todayStr,
    selectedDayOfWeek,
    selectedRecord,
    formatSelectedDate
}: AttendanceCalendarProps) {
    return (
        <View>
            <View className="bg-white rounded-2xl p-4 border border-blue-50/50 mt-4 shadow-sm">

                <View className="flex-row justify-around mb-2.5">
                    {WEEKDAYS.map((day, idx) => (
                        <View key={day} className="w-10 items-center">
                            <Text 
                                style={{ color: idx === 0 || idx === 6 ? "#94a3b8" : "#64748b" }}
                                className="text-[11px] font-bold"
                            >
                                {day}
                            </Text>
                        </View>
                    ))}
                </View>

                <View className="flex-row flex-wrap justify-start">
                    {calendarCells.map((cell, index) => {
                        if (cell.dayNum === null || !cell.dateStr) {
                            return <View key={`empty-${index}`} className="w-[14.28%] aspect-square justify-center items-center" />;
                        }

                        const record = recordsMap.get(cell.dateStr);
                        const isSelected = selectedDateStr === cell.dateStr;
                        const isFuture = cell.dateStr > todayStr;

                        let cellBg = "#f8fafc";
                        let cellBorderColor = "rgba(241, 245, 249, 0.7)";
                        let cellTextColor = "#334155";
                        let cellFontWeight: "600" | "bold" | "normal" | "300" = "600";
                        let showDot = false;

                        if (isFuture) {
                            cellBg = "transparent";
                            cellBorderColor = "transparent";
                            cellTextColor = "#cbd5e1";
                            cellFontWeight = "300";
                        } else if (record) {
                            showDot = true;

                            if (record.status === "P") {
                                cellBg = "#ecfdf5";
                                cellBorderColor = "#d1fae5";
                                cellTextColor = "#065f46";
                            } else if (record.status === "A") {
                                cellBg = "#fff1f2";
                                cellBorderColor = "#ffe4e6";
                                cellTextColor = "#9f1239";
                            } else if (record.status === "L") {
                                cellBg = "#fffbeb";
                                cellBorderColor = "#fef3c7";
                                cellTextColor = "#92400e";
                            } else if (record.status === "HD") {
                                cellBg = "#eff6ff";
                                cellBorderColor = "#dbeafe";
                                cellTextColor = "#1e40af";
                            } else if (record.status === "H") {
                                cellBg = "#faf5ff";
                                cellBorderColor = "#f3e8ff";
                                cellTextColor = "#6b21a8";
                            }
                            cellFontWeight = "bold";
                        } else {
                            if (cell.dayOfWeek === 0) {
                                cellBg = "rgba(250, 245, 255, 0.3)";
                                cellBorderColor = "rgba(243, 232, 255, 0.4)";
                                cellTextColor = "#d8b4fe";
                            }
                        }

                        const appliedStyle = {
                            backgroundColor: cellBg,
                            borderColor: isSelected ? "#1E88E5" : cellBorderColor,
                            borderWidth: isSelected ? 2 : 1,
                        };

                        return (
                            <Pressable
                                key={cell.dateStr}
                                onPress={() => !isFuture && setSelectedDateStr(cell.dateStr)}
                                disabled={isFuture}
                                style={{ width: "14.28%", padding: 2 }}
                                className="aspect-square active:opacity-75"
                            >
                                <View 
                                    style={appliedStyle}
                                    className="w-full h-full rounded-xl items-center justify-center relative"
                                >
                                    <Text 
                                        style={{ color: cellTextColor, fontWeight: cellFontWeight }}
                                        className="text-[13px]"
                                    >
                                        {cell.dayNum}
                                    </Text>
                                    
                                    {showDot ? (
                                        <View 
                                            style={{ backgroundColor: getDotColor(record?.status) }}
                                            className="w-1.5 h-1.5 rounded-full absolute bottom-1.5" 
                                        />
                                    ) : null}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-blue-50/50 mt-4 shadow-sm">
                <View className="flex-row items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <Ionicons name="information-circle-outline" size={18} color="#1E88E5" />
                    <Text className="text-[13.5px] font-bold text-slate-800">Day Details</Text>
                </View>

                {selectedDateStr ? (
                    selectedRecord ? (
                        <View>
                            <Text className="text-[14px] font-bold text-slate-700">{formatSelectedDate(selectedDateStr)}</Text>
                            
                            <View className="flex-row items-center gap-2 mt-3">
                                <View 
                                    style={{ 
                                        backgroundColor: getStatusDetails(selectedRecord.status).bg,
                                        borderColor: getStatusDetails(selectedRecord.status).borderColor,
                                        borderWidth: 1 
                                    }}
                                    className="px-3 py-1 rounded-full flex-row items-center gap-1.5"
                                >
                                    <View 
                                        style={{ backgroundColor: getStatusDetails(selectedRecord.status).cellBg }}
                                        className="w-2 h-2 rounded-full" 
                                    />
                                    <Text 
                                        style={{ color: getStatusDetails(selectedRecord.status).text }}
                                        className="text-[12px] font-extrabold"
                                    >
                                        {getStatusDetails(selectedRecord.status).label}
                                    </Text>
                                </View>
                                
                                {selectedRecord.remarks ? (
                                    <Text className="text-[11px] text-slate-400">Marked by teacher</Text>
                                ) : null}
                            </View>

                            <View className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-3">
                                <Text className="text-[11px] text-slate-400 font-semibold mb-0.5">Remarks / Comments:</Text>
                                <Text className="text-[12.5px] text-slate-600 leading-5 italic">
                                    {selectedRecord.remarks || "No comments or remarks recorded for this day."}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-[14px] font-bold text-slate-700">{formatSelectedDate(selectedDateStr)}</Text>
                            
                            <View className="flex-row items-center gap-2 mt-3">
                                <View className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 flex-row items-center gap-1.5">
                                    <View className="w-2 h-2 rounded-full bg-slate-300" />
                                    <Text className="text-[12px] font-bold text-slate-500">
                                        {selectedDayOfWeek === 0 ? "Weekly Off" : "No Attendance Marked"}
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-3">
                                <Text className="text-[12px] text-slate-400 italic">
                                    {selectedDayOfWeek === 0 
                                        ? "Sundays are weekly off-days for classes."
                                        : "Attendance records are not available or have not been updated for this date."}
                                </Text>
                            </View>
                        </View>
                    )
                ) : (
                    <Text className="text-slate-400 text-[12.5px] italic text-center py-4">
                        Select any date on the calendar above to view details.
                    </Text>
                )}
            </View>
        </View>
    );
}
