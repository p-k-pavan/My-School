import React, { useState } from "react";
import { ScrollView, StatusBar, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetHomeworkByClassQuery, useGetHomeworkByTeacherQuery } from "@/redux/api/homework";
import { useGetTeacherByUserIdQuery } from "@/redux/api/teacher";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { router, Redirect } from "expo-router";
import AttachmentViewer from "@/components/shared/AttachmentViewer";

const SUBJECT_STYLING: Record<string, { bg: string; color: string; icon: string }> = {
  KANNADA: { bg: "bg-amber-50", color: "#D97706", icon: "book-open" },
  ENGLISH: { bg: "bg-blue-50", color: "#1E88E5", icon: "book" },
  MATH: { bg: "bg-green-50", color: "#16A34A", icon: "calculator" },
  MATHEMATICS: { bg: "bg-green-50", color: "#16A34A", icon: "calculator" },
  SCIENCE: { bg: "bg-violet-50", color: "#7C3AED", icon: "flask" },
  SOCIAL: { bg: "bg-rose-50", color: "#E11D48", icon: "globe" },
};

const getSubjectStyle = (subjectName: string = "") => {
  const norm = subjectName.trim().toUpperCase();
  return (
    SUBJECT_STYLING[norm] || { bg: "bg-slate-50", color: "#64748b", icon: "book" }
  );
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
};

const formatHeaderDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const today = new Date().toISOString().split("T")[0];
    if (dateStr === today) {
      return `Today, ${d.getDate()} ${months[d.getMonth()]}`;
    }
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];
    if (dateStr === yesterday) {
      return `Yesterday, ${d.getDate()} ${months[d.getMonth()]}`;
    }

    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export default function AllHomework() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Redirect href="/" />;
  }

  const isParent = (user as any)?.role === "parent";
  const isTeacher = (user as any)?.role === "teacher";
  
  const parentId = isParent ? String((user as any).id) : undefined;
  const { data: parentData, isLoading: isParentLoading } = useGetParentsByUserIdQuery(
    parentId as string | undefined,
    { skip: !isParent || !parentId }
  );

  const student = parentData?.parent?.studentIds?.[0];
  const classId = student?.classId?._id;

  const [assignedDate, setAssignedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: hwData, isLoading: isHomeworkLoading } = useGetHomeworkByClassQuery(
    { classId, assigned: assignedDate },
    { skip: !classId || isTeacher }
  );

  const { data: teacherHwData, isLoading: isTeacherHomeworkLoading } = useGetHomeworkByTeacherQuery(
    { assigned: assignedDate },
    { skip: !isTeacher }
  );

  const { data: teacherData } = useGetTeacherByUserIdQuery(
    (user as any)?.id as string | undefined,
    { skip: !isTeacher || !(user as any)?.id }
  );

  const homework = isTeacher ? teacherHwData?.homework : hwData?.homework;
  const isLoading = isTeacher
    ? (isTeacherHomeworkLoading)
    : (isParentLoading || isHomeworkLoading);

  const changeDate = (days: number) => {
    const d = new Date(assignedDate);
    d.setDate(d.getDate() + days);
    setAssignedDate(d.toISOString().split("T")[0]);
  };

  const displayName = isTeacher
    ? (teacherData?.teacher?.teacherName || (user as any)?.name || "Teacher")
    : (student?.studentName || "John Doe");

  const displayClassInfo = isTeacher
    ? "Teacher Profile"
    : (student ? `Class ${student.classId.className}${student.classId.section || ""}` : "");

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <View className="flex-row items-center px-4 py-3.5 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 rounded-full active:bg-slate-100">
          <Ionicons name="arrow-back" size={22} color="#1E88E5" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800">Homework Details</Text>
          <Text className="text-xs text-slate-500">
            {displayName} • {displayClassInfo}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center bg-white px-4 py-2.5 border-b border-slate-200">
        <TouchableOpacity 
          onPress={() => changeDate(-1)} 
          className="p-1 rounded-full active:bg-slate-100"
        >
          <Ionicons name="chevron-back" size={20} color="#1E88E5" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={15} color="#64748b" />
          <Text className="text-[13.5px] font-semibold text-slate-700">
            {formatHeaderDate(assignedDate)}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => changeDate(1)} 
          className="p-1 rounded-full active:bg-slate-100"
        >
          <Ionicons name="chevron-forward" size={20} color="#1E88E5" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      ) : !homework || homework.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
          <Text className="text-slate-500 text-[14px] mt-2">
            No homework assigned for this date.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
          {homework.map((item: any) => {
            const subjectName = item.subjectId?.subjectName || "Subject";
            const style = getSubjectStyle(subjectName);
            const className = item.classId
              ? `Class ${item.classId.className}${item.classId.section || ""}`
              : "N/A";

            const footerText = isTeacher ? className : (item.teacherId?.teacherName || "Teacher");
            const footerIcon = isTeacher ? "school-outline" : "person-outline";

            return (
              <View
                key={item._id}
                className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className={`w-9 h-9 ${style.bg} rounded-lg items-center justify-center`}>
                      <FontAwesome6 name={style.icon} size={15} color={style.color} />
                    </View>
                    <View>
                      <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {subjectName}
                      </Text>
                      <Text className="text-[15px] font-bold text-slate-800 mt-0.5">
                        {item.title}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-red-50 px-2.5 py-1 rounded-full">
                    <Text className="text-[11px] font-semibold text-red-600">
                      Due: {formatDate(item.dueDate)}
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] text-slate-500 leading-5 mt-1 mb-3">
                  {item.description}
                </Text>

                {item.attachments && item.attachments.length > 0 && (
                  <View className="mb-2">
                    <AttachmentViewer attachments={item.attachments} />
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name={footerIcon as any} size={13} color="#94a3b8" />
                    <Text className="text-[11px] text-slate-400">
                      {footerText}
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
