import React from "react";
import { View, Text } from "react-native";

interface AttendanceStatsProps {
    attendancePercentage: string;
    totalMarkedDays: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    halfDayCount: number;
    holidayCount: number;
}

export default function AttendanceStats({
    attendancePercentage,
    totalMarkedDays,
    presentCount,
    absentCount,
    lateCount,
    halfDayCount,
    holidayCount
}: AttendanceStatsProps) {
    return (
        <View className="bg-white rounded-2xl p-4 border border-blue-50/50 mt-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-[12px] text-slate-400 font-medium">Monthly Attendance Rate</Text>
                    <Text className="text-[28px] font-black text-blue-950 mt-0.5">{attendancePercentage}%</Text>
                </View>
                <View className="h-12 w-28 items-end justify-center">
                    <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        <Text className="text-[10px] text-blue-800 font-bold uppercase">{totalMarkedDays} Days Marked</Text>
                    </View>
                </View>
            </View>

            <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                <View 
                    className="h-full bg-[#1E88E5] rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(attendancePercentage)))}%` }}
                />
            </View>

            <View className="flex-row justify-between items-center pt-1.5 border-t border-slate-100/70">
                <View className="items-center flex-1">
                    <View className="w-7 h-7 bg-emerald-100 rounded-full items-center justify-center mb-1">
                        <Text className="text-[11px] font-bold text-emerald-800">P</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-medium">Present</Text>
                    <Text className="text-[14px] font-bold text-slate-700 mt-0.5">{presentCount}</Text>
                </View>
                
                <View className="items-center flex-1">
                    <View className="w-7 h-7 bg-rose-100 rounded-full items-center justify-center mb-1">
                        <Text className="text-[11px] font-bold text-rose-800">A</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-medium">Absent</Text>
                    <Text className="text-[14px] font-bold text-slate-700 mt-0.5">{absentCount}</Text>
                </View>

                <View className="items-center flex-1">
                    <View className="w-7 h-7 bg-amber-100 rounded-full items-center justify-center mb-1">
                        <Text className="text-[11px] font-bold text-amber-800">L</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-medium">Late</Text>
                    <Text className="text-[14px] font-bold text-slate-700 mt-0.5">{lateCount}</Text>
                </View>

                <View className="items-center flex-1">
                    <View className="w-7 h-7 bg-blue-100 rounded-full items-center justify-center mb-1">
                        <Text className="text-[11px] font-bold text-blue-800">HD</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-medium">Half Day</Text>
                    <Text className="text-[14px] font-bold text-slate-700 mt-0.5">{halfDayCount}</Text>
                </View>

                <View className="items-center flex-1">
                    <View className="w-7 h-7 bg-purple-100 rounded-full items-center justify-center mb-1">
                        <Text className="text-[11px] font-bold text-purple-800">H</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-medium">Holiday</Text>
                    <Text className="text-[14px] font-bold text-slate-700 mt-0.5">{holidayCount}</Text>
                </View>
            </View>
        </View>
    );
}
