import React from "react";
import { View, Text } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getStatusDetails } from "./AttendanceCalendar";

interface AttendanceLogsProps {
    records: any[];
    formatDateShort: (dateStr: string) => string;
    dayNames: string[];
}

export default function AttendanceLogs({
    records,
    formatDateShort,
    dayNames
}: AttendanceLogsProps) {
    return (
        <View className="mt-4 gap-3">
            {records.length === 0 ? (
                <View className="bg-white rounded-2xl p-8 border border-blue-50/50 items-center justify-center shadow-sm">
                    <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                    <Text className="text-slate-400 text-[13.5px] mt-2 font-medium">
                        No attendance records found for this month.
                    </Text>
                </View>
            ) : (
                [...records]
                    .sort((a, b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime())
                    .map((record: any) => {
                        const details = getStatusDetails(record.status);
                        const dateObj = new Date(record.attendanceDate);
                        const dayOfWeek = dateObj.getDay();
                        const dayName = dayNames[dayOfWeek] || "";

                        return (
                            <View
                                key={record._id || record.attendanceDate}
                                className="bg-white rounded-2xl p-4 border border-blue-50/50 shadow-sm"
                            >
                                <View className="flex-row justify-between items-center">
                                    <View>
                                        <Text className="text-[14px] font-bold text-slate-800">
                                            {formatDateShort(record.attendanceDate)}
                                        </Text>
                                        <Text className="text-[11.5px] text-slate-400 mt-0.5">
                                            {dayName}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            backgroundColor: details.bg,
                                            borderColor: details.borderColor,
                                            borderWidth: 1
                                        }}
                                        className="px-3 py-1.5 rounded-xl flex-row items-center gap-1.5"
                                    >
                                        <View
                                            style={{ backgroundColor: details.cellBg }}
                                            className="w-2 h-2 rounded-full"
                                        />
                                        <Text
                                            style={{ color: details.text }}
                                            className="text-[12px] font-extrabold uppercase tracking-wider"
                                        >
                                            {details.label}
                                        </Text>
                                    </View>
                                </View>

                                {record.remarks ? (
                                    <View className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-3 flex-row items-start gap-2">
                                        <MaterialIcons name="mode-comment" size={14} color="#64748b" />
                                        <View className="flex-1">
                                            <Text className="text-[12px] text-slate-600 leading-4 italic">
                                                {record.remarks}
                                            </Text>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        );
                    })
            )}
        </View>
    );
}
