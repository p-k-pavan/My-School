import React, { useState } from "react";
import { ScrollView, StatusBar, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetTimetableByClassQuery } from "@/redux/api/timetable";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const parseTime = (timeStr: string) => {
  try {
    const parts = timeStr.trim().split(/\s+/);
    if (parts.length < 2) return new Date();
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    }
    if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch {
    return new Date();
  }
};

const getPeriodStatus = (startTimeStr: string, endTimeStr: string, isToday: boolean) => {
  if (!isToday) {
    return { status: "Scheduled", active: false, statusColor: "bg-slate-50 text-slate-500" };
  }
  try {
    const now = new Date();
    const start = parseTime(startTimeStr);
    const end = parseTime(endTimeStr);
    if (now >= start && now <= end) {
      return { status: "Ongoing", active: true, statusColor: "bg-blue-50 text-blue-700" };
    } else if (now < start) {
      return { status: "Upcoming", active: false, statusColor: "bg-slate-100 text-slate-500" };
    } else {
      return { status: "Completed", active: false, statusColor: "bg-green-50 text-green-700" };
    }
  } catch {
    return { status: "Scheduled", active: false, statusColor: "bg-slate-50 text-slate-500" };
  }
};

const getTimelineColors = (status: string) => {
  switch (status) {
    case "Completed":
      return {
        dot: "border-green-500 bg-green-50",
        line: "bg-green-400",
      };
    case "Ongoing":
      return {
        dot: "border-blue-500 bg-blue-50",
        line: "bg-blue-400",
      };
    case "Upcoming":
    case "Scheduled":
    default:
      return {
        dot: "border-yellow-500 bg-yellow-50",
        line: "bg-yellow-400",
      };
  }
};

export default function TimetableDetail() {
  const user = useAppSelector((state) => state.auth.user);
  const isParent = (user as any)?.role === "parent";
  const parentId = isParent ? String((user as any).id) : undefined;
  const { data: parentData, isLoading: isParentLoading } = useGetParentsByUserIdQuery(
    parentId as string | undefined,
    { skip: !isParent || !parentId }
  );

  const student = parentData?.parent?.studentIds?.[0];
  const classId = student?.classId?._id;
  const academicYear = "2026-2027";

  const { data: ttData, isLoading: isTimetableLoading } = useGetTimetableByClassQuery(
    { classId, academicYear },
    { skip: !classId }
  );

  const timetable = ttData?.timetable;
  const isLoading = isParentLoading || isTimetableLoading;

  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayName = currentDayIndex === 0 ? "Monday" : DAYS_OF_WEEK[currentDayIndex - 1];

  const [selectedDay, setSelectedDay] = useState(todayName);

  const activeDayData = Array.isArray(timetable)
    ? timetable.find((t) => t.day.toLowerCase() === selectedDay.toLowerCase())
    : null;

  const periods = activeDayData?.periods || [];
  const sortedPeriods = [...periods].sort((a, b) => a.periodNo - b.periodNo);

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 rounded-full active:bg-slate-100">
          <Ionicons name="arrow-back" size={22} color="#1E88E5" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800">Class Timetable</Text>
          {student && (
            <Text className="text-xs text-slate-500">
              {student.studentName} • Class {student.classId.className}{student.classId.section || ""}
            </Text>
          )}
        </View>
      </View>

      <View className="bg-white border-b border-slate-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = day === selectedDay;
            const isToday = day === todayName;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-2 mr-2.5 rounded-full border ${
                  isSelected
                    ? "bg-[#1E88E5] border-[#1E88E5]"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text
                  className={`text-[12.5px] font-semibold ${
                    isSelected ? "text-white" : "text-slate-600"
                  }`}
                >
                  {day} {isToday ? "(Today)" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      ) : sortedPeriods.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
          <Text className="text-slate-500 text-[14px] mt-2">
            No classes scheduled for {selectedDay}.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
          {sortedPeriods.map((item, i) => {
            const isToday = selectedDay === todayName;
            const { status, active, statusColor } = getPeriodStatus(
              item.startTime,
              item.endTime,
              isToday
            );
            const colors = getTimelineColors(status);

            return (
              <View
                key={i}
                className="bg-white rounded-xl px-4 py-3.5 mb-2 border border-slate-100 flex-row items-center gap-3"
              >
                <View className="w-20">
                  <Text className="text-[13px] font-semibold text-slate-700">
                    {item.startTime}
                  </Text>
                  <Text className="text-[12px] text-slate-400 mt-0.5">
                    {item.endTime}
                  </Text>
                </View>
                <View className="items-center gap-0.5">
                  <View
                    className={`w-2.5 h-2.5 rounded-full border-2 ${colors.dot}`}
                  />
                  {i < sortedPeriods.length - 1 && (
                    <View
                      className={`w-0.5 h-6 ${colors.line}`}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-slate-800">
                    {item.subjectId?.subjectName || "Subject"}
                  </Text>
                  <Text className="text-[12px] text-slate-400 mt-0.5">
                    {item.teacherId?.teacherName || "Teacher"} • Period {item.periodNo}
                  </Text>
                  <View
                    className={`self-start mt-1.5 px-2.5 py-0.5 rounded-full ${statusColor}`}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        statusColor.split(" ")[1]
                      }`}
                    >
                      {status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
