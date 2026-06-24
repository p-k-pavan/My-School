import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import ParentProfile from "@/components/profile/ParentProfile";
import TeacherProfile from "@/components/profile/TeacherProfile";

export default function Profile() {
  const user = useAppSelector((state) => state.auth.user);
  const isTeacher = (user as any)?.role === "teacher";

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      {isTeacher ? (
        <TeacherProfile userId={String((user as any).id)} />
      ) : (
        <ParentProfile userId={String((user as any).id)} />
      )}
    </SafeAreaView>
  );
}