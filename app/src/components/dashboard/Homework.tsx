import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AttachmentViewer from "../shared/AttachmentViewer";
import Skeleton from "../shared/Skeleton";

interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  _id: string;
}

interface HomeworkItem {
  _id: string;
  title: string;
  description: string;
  classId: string;
  subjectId?: {
    _id: string;
    subjectName: string;
    subjectCode: string;
  };
  teacherId?: {
    _id: string;
    teacherName: string;
  };
  attachments?: Attachment[];
  assignedDate: string;
  dueDate: string;
}

interface HomeworkProps {
  homework?: HomeworkItem[];
  isLoading?: boolean;
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
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
};

export default function Homework({ homework, isLoading }: HomeworkProps) {
  if (isLoading) {
    return (
      <>
        <View className="flex-row justify-between items-center mt-2 mb-3">
          <Skeleton width={150} height={16} />
          <Skeleton width={50} height={16} />
        </View>
        {[1, 2].map((key) => (
          <View
            key={key}
            className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center gap-2 flex-1">
                <Skeleton width={36} height={36} borderRadius={8} />
                <View className="flex-1 gap-1.5">
                  <Skeleton width="40%" height={11} />
                  <Skeleton width="70%" height={14} />
                </View>
              </View>
              <Skeleton width={80} height={20} borderRadius={12} />
            </View>
            <View className="mt-1 mb-3 gap-1.5">
              <Skeleton width="90%" height={11} />
              <Skeleton width="80%" height={11} />
            </View>
          </View>
        ))}
      </>
    );
  }

  if (!homework || homework.length === 0) {
    return (
      <>
        <View className="flex-row justify-between items-center mt-2 mb-3">
          <Text className="text-[15px] font-semibold text-slate-800">
            {"Today's homework"}
          </Text>
        </View>
        <View className="bg-white rounded-xl p-5 border border-slate-100 items-center justify-center">
          <Text className="text-slate-500 text-[14px]">
            No homework assigned for today.
          </Text>
        </View>
      </>
    );
  }

  const showSeeAll = homework.length > 2;
  const displayedHomework = showSeeAll ? homework.slice(0, 2) : homework;

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

      {displayedHomework.map((item) => {
        const subjectName = item.subjectId?.subjectName || "Subject";
        const style = getSubjectStyle(subjectName);

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
                <Ionicons name="person-outline" size={13} color="#94a3b8" />
                <Text className="text-[11px] text-slate-400">
                  {item.teacherId?.teacherName || "Teacher"}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

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
