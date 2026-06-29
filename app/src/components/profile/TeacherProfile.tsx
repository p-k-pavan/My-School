import React from "react";
import { ScrollView, View, Text, Image, ActivityIndicator, Alert, Pressable } from "react-native";
import { useGetTeacherByUserIdQuery } from "@/redux/api/teacher";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/reducer/authReducer";
import { useLogoutMutation, useDeactivateDeviceTokenMutation } from "@/redux/api/auth";
import { router } from "expo-router";
import { getOrCreateDeviceId, clearSyncedTokenInfo } from "@/services/PushNotifications";

interface TeacherProfileProps {
  userId: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export default function TeacherProfile({ userId }: TeacherProfileProps) {
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [deactivateDeviceToken] = useDeactivateDeviceTokenMutation();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const deviceId = await getOrCreateDeviceId();
              await deactivateDeviceToken({ deviceId }).unwrap();
            } catch (err) {
              console.log("Deactivate token failed:", err);
            }

            try {
              await logoutMutation(undefined).unwrap();
            } catch (err) {
              console.log("Backend logout failed:", err);
            } finally {
              await clearSyncedTokenInfo();
              dispatch(logout());
              router.replace("/");
            }
          },
        },
      ]
    );
  };

  const { data, isLoading } = useGetTeacherByUserIdQuery(userId);
  const teacher = data?.teacher;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
      {/* ── Custom Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <Text className="text-[18px] font-bold text-blue-900">Profile</Text>
        <View className="relative">
          <Ionicons name="notifications-outline" size={22} color="black" />
          <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E88E5]" />
        </View>
      </View>

      <View className="px-3 mt-4">
        {/* ── Teacher Card ── */}
        <View className="bg-white rounded-2xl border border-blue-100 mb-4 overflow-hidden">
          <View className="flex-row items-center gap-4 p-4">
            <View className="w-24 h-24 rounded-full items-center justify-center shrink-0 relative bg-slate-50 border border-slate-100">
              <Image
                source={
                  teacher?.profilePhoto
                    ? { uri: teacher.profilePhoto }
                    : require("@/assets/images/user.png")
                }
                style={{ width: 80, height: 80, borderRadius: 40 }}
                resizeMode="cover"
              />
              <View className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-slate-100">
                <Ionicons name="camera" size={16} color="blue" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-blue-900">
                {teacher?.teacherName || "Teacher Name"}
              </Text>
              <Text className="text-[13px] text-slate-500 mt-0.5">
                Employee ID: {teacher?.employeeId || "N/A"}
              </Text>
              <View className="bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 mt-1.5 self-start">
                <Text className="text-[11px] text-blue-700 font-semibold">Teacher</Text>
              </View>
            </View>
          </View>

          {/* ── Professional Details ── */}
          <View className="bg-white p-4 border-t border-slate-100">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="person" size={20} color="#1E88E5" />
              <Text className="text-[14px] font-bold text-blue-900">Professional Details</Text>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-[12.5px] text-slate-500">Qualification</Text>
              <Text className="text-[12.5px] font-medium text-slate-700">
                {teacher?.qualification || "N/A"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
              <Text className="text-[12.5px] text-slate-500">Joining Date</Text>
              <Text className="text-[12.5px] font-medium text-slate-700">
                {formatDate(teacher?.joiningDate)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
              <Text className="text-[12.5px] text-slate-500">Phone Number</Text>
              <Text className="text-[12.5px] font-medium text-slate-700">
                {teacher?.mobile ? `+91 ${teacher.mobile}` : "N/A"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
              <Text className="text-[12.5px] text-slate-500">Email Address</Text>
              <Text className="text-[12.5px] font-medium text-slate-700">
                {teacher?.email || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Settings Block ── */}
        <View className="bg-white rounded-2xl p-4 border border-blue-100 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="settings-outline" size={20} color="#1E88E5" />
            <Text className="text-[14px] font-bold text-blue-900">Settings</Text>
          </View>

          <Pressable 
            onPress={handleLogout}
            className="flex-row items-center justify-between py-2 active:bg-slate-50"
          >
            <View className="flex-row items-center gap-2">
              <AntDesign name="login" size={16} color="red" />
              <Text className="text-[12.5px] text-slate-500">Logout</Text>
            </View>
            <AntDesign name="right-circle" size={16} color="gray" />
          </Pressable>

          <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="contact-support" size={18} color="black" />
              <Text className="text-[12.5px] text-slate-500">Contact Support</Text>
            </View>
            <AntDesign name="right-circle" size={16} color="gray" />
          </View>

          <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="notifications-none" size={18} color="blue" />
              <Text className="text-[12.5px] text-slate-500">Notifications</Text>
            </View>
            <AntDesign name="right-circle" size={16} color="gray" />
          </View>

          <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="password" size={18} color="green" />
              <Text className="text-[12.5px] text-slate-500">Change Password</Text>
            </View>
            <AntDesign name="right-circle" size={16} color="gray" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
