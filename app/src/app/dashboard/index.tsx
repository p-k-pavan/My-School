import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import { Redirect } from "expo-router";
import Header from "@/components/dashboard/Header";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import Overview from "@/components/dashboard/Overview";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import Homework from "@/components/dashboard/Homework";
import TeacherSchedule from "@/components/dashboard/TeacherSchedule";
import TeacherHomework from "@/components/dashboard/TeacherHomework";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetTimetableByClassQuery } from "@/redux/api/timetable";
import { useState } from "react";
import { useGetHomeworkByClassQuery } from "@/redux/api/homework";
import { useGetTeacherByUserIdQuery } from "@/redux/api/teacher";
import { getLocalDateString } from "@/utils/date";

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Redirect href="/" />;
  }

  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [assignedDate, setAssignedDate] = useState(() => getLocalDateString());

  const isParent = (user as any)?.role === "parent";
  const isTeacher = (user as any)?.role === "teacher";
  const parentId = isParent ? String((user as any).id) : undefined;
  
  const { data: parentData, isLoading: isParentLoading } = useGetParentsByUserIdQuery(parentId as string | undefined, { skip: !isParent || !parentId });

  const selectedStudentId = useAppSelector((state) => state.auth.selectedStudentId);
  const studentIds = parentData?.parent?.studentIds || [];
  const student = studentIds.find((s: any) => s._id === selectedStudentId) || studentIds[0];
  const studentName = student?.studentName || "John Doe";
  const classInfo = student?.classId
    ? `Class ${student.classId.className}${student.classId.section || ""}`
    : "Class 10A  •  Roll No: 123";

  const classId = student?.classId?._id;
  const { data: tt, isLoading: isTimetableLoading } = useGetTimetableByClassQuery(
    { classId, academicYear },
    { skip: !classId || isTeacher }
  );

  const { data: hwData, isLoading: isHomeworkLoading } = useGetHomeworkByClassQuery(
    { classId, assigned: assignedDate },
    { skip: !classId || isTeacher }
  );

  const timetable = tt?.timetable;
  const homework = hwData?.homework;

  const { data: teacherData } = useGetTeacherByUserIdQuery(
    (user as any)?.id as string | undefined,
    { skip: !isTeacher || !(user as any)?.id }
  );

  const displayName = isTeacher
    ? (teacherData?.teacher?.teacherName || (user as any)?.name || "Teacher")
    : studentName;

  const displayClassInfo = isTeacher
    ? `Teacher • EMP: ${teacherData?.teacher?.employeeId || "N/A"}`
    : classInfo;

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        {/* ── Header ── */}
        <Header studentName={displayName} classInfo={displayClassInfo} />

        <View className="px-3">

          {/* ── Announcement card ── */}
          <AnnouncementCard />

          {isTeacher ? (
            <>
              <TeacherSchedule academicYear={academicYear} />

              <TeacherHomework assignedDate={assignedDate} />
            </>
          ) : (
            <>
              <Overview />

              <TodaySchedule timetable={timetable} isLoading={isTimetableLoading || isParentLoading} />

              <Homework homework={homework} isLoading={isHomeworkLoading || isParentLoading} />
            </>
          )}

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}