import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Skeleton from "../shared/Skeleton";

interface Period {
  periodNo: number;
  subjectId?: {
    subjectName: string;
    subjectCode: string;
  };
  teacherId?: {
    teacherName: string;
    email?: string;
    mobile?: string;
  };
  startTime: string;
  endTime: string;
}

interface TimetableDay {
  day: string;
  periods: Period[];
}

interface TodayScheduleProps {
  timetable?: TimetableDay[];
  isLoading?: boolean;
}

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

const getPeriodStatus = (startTimeStr: string, endTimeStr: string) => {
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
    return { status: "Upcoming", active: false, statusColor: "bg-slate-100 text-slate-500" };
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

export default function TodaySchedule({ timetable, isLoading }: TodayScheduleProps) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = daysOfWeek[new Date().getDay()];

  if (isLoading) {
    return (
      <>
        <View className="flex-row justify-between items-center mb-3">
          <Skeleton width={180} height={15} />
          <Skeleton width={50} height={15} />
        </View>
        {[1, 2].map((key) => (
          <View
            key={key}
            className="bg-white rounded-xl px-4 py-3.5 mb-2 border border-slate-100 flex-row items-center gap-3"
          >
            <View className="w-20 gap-1.5">
              <Skeleton width="80%" height={13} />
              <Skeleton width="60%" height={11} />
            </View>
            <View className="items-center gap-0.5">
              <Skeleton width={10} height={10} borderRadius={5} />
              {key < 2 && <Skeleton width={2} height={24} />}
            </View>
            <View className="flex-1 gap-1.5">
              <Skeleton width="60%" height={14} />
              <Skeleton width="80%" height={11} />
              <Skeleton width="30%" height={16} borderRadius={8} />
            </View>
          </View>
        ))}
      </>
    );
  }

  const todayTimetable = Array.isArray(timetable)
    ? timetable.find((t) => t.day.toLowerCase() === todayName.toLowerCase())
    : null;

  const todayPeriods = todayTimetable?.periods || [];
  const sortedPeriods = [...todayPeriods].sort((a, b) => a.periodNo - b.periodNo);

  const periodsWithStatus = sortedPeriods.map((p) => {
    const statusInfo = getPeriodStatus(p.startTime, p.endTime);
    return { ...p, ...statusInfo };
  });

  const ongoingIndex = periodsWithStatus.findIndex((p) => p.status === "Ongoing");

  let displayedPeriods: typeof periodsWithStatus = [];

  if (ongoingIndex !== -1) {
    if (ongoingIndex === 0) {
      displayedPeriods = periodsWithStatus.slice(0, Math.min(3, periodsWithStatus.length));
    } else if (ongoingIndex === periodsWithStatus.length - 1) {
      displayedPeriods = periodsWithStatus.slice(Math.max(0, periodsWithStatus.length - 3));
    } else {
      displayedPeriods = periodsWithStatus.slice(ongoingIndex - 1, ongoingIndex + 2);
    }
  } else {
    const firstUpcomingIndex = periodsWithStatus.findIndex((p) => p.status === "Upcoming");
    if (firstUpcomingIndex !== -1) {
      const startIndex = Math.max(0, firstUpcomingIndex - 1);
      displayedPeriods = periodsWithStatus.slice(startIndex, startIndex + 3);
    } else {
      displayedPeriods = periodsWithStatus.slice(Math.max(0, periodsWithStatus.length - 3));
    }
  }

  return (
    <>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[15px] font-semibold text-slate-800">
          {"Today's schedule"} ({todayName})
        </Text>
        <TouchableOpacity onPress={() => router.push("/dashboard/timetable")}>
          <Text className="text-[13px] text-[#1E88E5]">See all</Text>
        </TouchableOpacity>
      </View>

      {displayedPeriods.length === 0 ? (
        <View className="bg-white rounded-xl p-5 border border-slate-100 items-center justify-center">
          <Text className="text-slate-500 text-[14px]">
            No classes scheduled for today.
          </Text>
        </View>
      ) : (
        displayedPeriods.map((item, i) => {
          const colors = getTimelineColors(item.status);

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
                {i < displayedPeriods.length - 1 && (
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
                  className={`self-start mt-1.5 px-2.5 py-0.5 rounded-full ${item.statusColor}`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      item.statusColor.split(" ")[1]
                    }`}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </>
  );
}
