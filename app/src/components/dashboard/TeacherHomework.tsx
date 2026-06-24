import React from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useGetHomeworkByTeacherQuery } from "@/redux/api/homework";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AttachmentViewer from "../shared/AttachmentViewer";

interface TeacherHomeworkProps {
  assignedDate?: string;
}

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

export default function TeacherHomework({ assignedDate }: TeacherHomeworkProps) {
  const defaultDate = assignedDate || new Date().toISOString().split("T")[0];
  const { data, isLoading } = useGetHomeworkByTeacherQuery({ assigned: defaultDate });
  const homework = data?.homework || [];

  const showSeeAll = homework.length > 2;
  const displayedHomework = showSeeAll ? homework.slice(0, 2) : homework;

  if (isLoading) {
    return (
      <View className="bg-white rounded-xl p-5 border border-slate-100 items-center justify-center mb-3">
        <ActivityIndicator size="small" color="#1E88E5" />
      </View>
    );
  }

  return (
    <>
      <View className="flex-row justify-between items-center mt-2 mb-3">
        <Text className="text-[15px] font-semibold text-slate-800">
          {"Today's homework"}
        </Text>
        <TouchableOpacity onPress={() => router.push("/dashboard/homework")}>
          <Text className="text-[13px] text-[#1E88E5]">See all</Text>
        </TouchableOpacity>
      </View>

      {homework.length === 0 ? (
        <View className="bg-white rounded-xl p-5 border border-slate-100 items-center justify-center mb-3">
          <Text className="text-slate-500 text-[14px]">
            No homework assigned for today.
          </Text>
        </View>
      ) : (
        displayedHomework.map((item: any) => {
          const subjectName = item.subjectId?.subjectName || "Subject";
          const style = getSubjectStyle(subjectName);
          const className = item.classId
            ? `Class ${item.classId.className}${item.classId.section || ""}`
            : "N/A";

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
                  <View
                    className={`w-9 h-9 ${style.bg} rounded-lg items-center justify-center`}
                  >
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
                  <Ionicons name="school-outline" size={13} color="#94a3b8" />
                  <Text className="text-[11px] text-slate-400">
                    {className}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}

      {showSeeAll && (
        <TouchableOpacity
          onPress={() => router.push("/dashboard/homework")}
          className="bg-white border border-slate-200 rounded-xl py-3 items-center justify-center mt-1 mb-4 active:bg-slate-50"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="text-[#1E88E5] text-[13.5px] font-bold">
            See all homework ({homework.length})
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}
