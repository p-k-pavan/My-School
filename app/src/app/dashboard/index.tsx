import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import Header from "@/components/dashboard/Header";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import Overview from "@/components/dashboard/Overview";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import Homework from "@/components/dashboard/Homework";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetTimetableByClassQuery } from "@/redux/api/timetable";
import { useState } from "react";
import {  useGetHomeworkByClassQuery } from "@/redux/api/homework";

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [assignedDate, setAssignedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const isParent = (user as any)?.role === "parent";
  const parentId = isParent ? String((user as any).id) : undefined;
  const { data, isLoading } = useGetParentsByUserIdQuery(parentId as string | undefined, { skip: !isParent || !parentId });

  const student = data?.parent?.studentIds?.[0];
  const studentName = student?.studentName || "John Doe";
  const classInfo = student?.classId
    ? `Class ${student.classId.className}${student.classId.section || ""}`
    : "Class 10A  •  Roll No: 123";

  const classId = student?.classId?._id;
  const { data: tt } = useGetTimetableByClassQuery(
    { classId, academicYear },
    { skip: !classId }
  );

  const {
    data: hwData,
    isLoading: isHomeworkLoading,
    isFetching: isHomeworkFetching
  } = useGetHomeworkByClassQuery(
    { classId, assigned: assignedDate },
    { skip: !classId }
  );


  const timetable = tt?.timetable;
  const homework = hwData?.homework;



  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        {/* ── Header ── */}
        <Header studentName={studentName} classInfo={classInfo} />

        <View className="px-3">

          {/* ── Announcement card ── */}
          <AnnouncementCard />

          {/* ── Overview ── */}
          <Overview />

          {/* ── Today's schedule ── */}
          <TodaySchedule timetable={timetable} />

          {/* ── Today's updates ── */}
          <Homework homework={homework}/>

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}