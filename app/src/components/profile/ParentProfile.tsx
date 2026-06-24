import React, { useState } from "react";
import { ScrollView, View, Text, Image, Pressable, ActivityIndicator, Alert } from "react-native";
import { useGetParentsByUserIdQuery } from "@/redux/api/parent";
import { useGetStudentByIdQuery } from "@/redux/api/student";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setSelectedStudentId, logout } from "@/redux/reducer/authReducer";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLogoutMutation } from "@/redux/api/auth";

interface ParentProfileProps {
  userId: string;
}

const formatDob = (dateStr?: string) => {
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

export default function ParentProfile({ userId }: ParentProfileProps) {
  const dispatch = useAppDispatch();
  const selectedStudentId = useAppSelector((state) => state.auth.selectedStudentId);
  const [logoutMutation] = useLogoutMutation();

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
              await logoutMutation(undefined).unwrap();
            } catch (err) {
              console.log("Backend logout failed:", err);
            } finally {
              dispatch(logout());
              router.replace("/");
            }
          },
        },
      ]
    );
  };

  const { data: parentData, isLoading: isParentLoading } = useGetParentsByUserIdQuery(userId);

  const parent = parentData?.parent;
  const studentIds = parentData?.parent?.studentIds || [];
  
  const activeStudent = studentIds.find((s: any) => s._id === selectedStudentId) || studentIds[0];

  const { data: studentDetail, isLoading: isStudentDetailLoading } = useGetStudentByIdQuery(
    activeStudent?._id as string | undefined,
    { skip: !activeStudent?._id }
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isParentLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <Text className="text-[18px] font-bold text-blue-900">Profile</Text>
        <View className="relative">
          <Ionicons name="notifications-outline" size={22} color="black" />
          <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E88E5]" />
        </View>
      </View>

      <View className="px-3">
        {/* ── Switch Account Dropdown Selector (if more than 1 student exists) ── */}
        {studentIds.length > 1 && (
          <View
            className="bg-white rounded-2xl p-2 border border-blue-100 my-4"
            style={{
              shadowColor: "#1E88E5",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="text-[12px] text-slate-500 mt-1 font-medium pl-2">
              Switch Account
            </Text>

            <Pressable
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex-row items-center gap-3 bg-blue-50 rounded-2xl p-2 mt-1.5 border border-blue-100"
            >
              <View className="w-10 h-10 rounded-full items-center justify-center shrink-0 ml-1 bg-white">
                <Image
                  source={require("@/assets/images/user.png")}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-row items-center justify-between flex-1 pr-2">
                <View>
                  <Text className="text-[14px] font-bold text-blue-900">
                    {activeStudent?.studentName}
                  </Text>
                  <Text className="text-[12px] text-slate-500 mt-0.5">
                    {activeStudent?.classId
                      ? `Class ${activeStudent.classId.className}${activeStudent.classId.section || ""} • Roll: ${activeStudent.rollNo}`
                      : "Class Detail"}
                  </Text>
                </View>
                <View className="bg-[#1E88E5] p-1 rounded-full">
                  <AntDesign name={isDropdownOpen ? "caret-up" : "caret-down"} size={12} color="white" />
                </View>
              </View>
            </Pressable>

            {isDropdownOpen && (
              <View className="mt-2 bg-white rounded-xl border border-slate-100 overflow-hidden">
                {studentIds
                  .filter((s: any) => s._id !== activeStudent?._id)
                  .map((s: any) => (
                    <Pressable
                      key={s._id}
                      onPress={() => {
                        dispatch(setSelectedStudentId(s._id));
                        setIsDropdownOpen(false);
                      }}
                      className="flex-row items-center gap-3 p-3 border-b border-slate-50 active:bg-slate-50"
                    >
                      <View className="w-9 h-9 rounded-full items-center justify-center bg-slate-100">
                        <Image
                          source={require("@/assets/images/user.png")}
                          style={{ width: 24, height: 24, borderRadius: 12 }}
                          resizeMode="contain"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-slate-700">{s.studentName}</Text>
                        <Text className="text-xs text-slate-400">
                          {s.classId
                            ? `Class ${s.classId.className}${s.classId.section || ""} • Roll: ${s.rollNo}`
                            : ""}
                        </Text>
                      </View>
                      <Ionicons name="swap-horizontal" size={16} color="#1E88E5" />
                    </Pressable>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* ── Student Header & Dynamic Details ── */}
        <View className="bg-white rounded-2xl border border-blue-100 mt-4 mb-4 overflow-hidden">
          <View className="flex-row items-center gap-4 p-4">
            <View className="w-24 h-24 rounded-full items-center justify-center shrink-0 relative bg-slate-50 border border-slate-100">
              <Image
                source={
                  studentDetail?.student?.profilePhoto
                    ? { uri: studentDetail.student.profilePhoto }
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
                {studentDetail?.student?.studentName || activeStudent?.studentName}
              </Text>
              <Text className="text-[13px] text-slate-500 mt-0.5">
                Admission No: {studentDetail?.student?.admissionNo || activeStudent?.admissionNo || "N/A"}
              </Text>
              <View className="bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 mt-1.5 self-start">
                <Text className="text-[11px] text-blue-700 font-semibold">
                  {activeStudent?.classId
                    ? `Class ${activeStudent.classId.className}${activeStudent.classId.section || ""}`
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Student Information Block ── */}
          <View className="bg-white p-4 border-t border-slate-100">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="person" size={20} color="#1E88E5" />
              <Text className="text-[14px] font-bold text-blue-900">Student Details</Text>
            </View>

            {isStudentDetailLoading ? (
              <View className="py-4 justify-center items-center">
                <ActivityIndicator size="small" color="#1E88E5" />
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-[12.5px] text-slate-500">Date of Birth</Text>
                  <Text className="text-[12.5px] font-medium text-slate-700">
                    {formatDob(studentDetail?.student?.dob)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
                  <Text className="text-[12.5px] text-slate-500">Gender</Text>
                  <Text className="text-[12.5px] font-medium text-slate-700">
                    {studentDetail?.student?.gender || "N/A"}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
                  <Text className="text-[12.5px] text-slate-500">Blood Group</Text>
                  <Text className="text-[12.5px] font-medium text-slate-700">
                    {studentDetail?.student?.bloodGroup || "N/A"}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
                  <Text className="text-[12.5px] text-slate-500">Address</Text>
                  <Text className="text-[12.5px] font-medium text-slate-700 text-right flex-1 ml-4" numberOfLines={2}>
                    {studentDetail?.student?.address || "N/A"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── Parents/Guardians Block ── */}
        <View className="bg-white rounded-2xl p-4 border border-blue-100 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <MaterialIcons name="people" size={20} color="#1E88E5" />
            <Text className="text-[14px] font-bold text-blue-900">Parents / Guardians</Text>
          </View>

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-[12.5px] text-slate-500">Father Name</Text>
            <Text className="text-[12.5px] font-medium text-slate-700">{parent?.fatherName || "N/A"}</Text>
          </View>

          <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
            <Text className="text-[12.5px] text-slate-500">Mother Name</Text>
            <Text className="text-[12.5px] font-medium text-slate-700">{parent?.motherName || "N/A"}</Text>
          </View>

          <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
            <Text className="text-[12.5px] text-slate-500">Phone Number</Text>
            <Text className="text-[12.5px] font-medium text-slate-700">{parent?.phoneNumber ? `+91 ${parent.phoneNumber}` : "N/A"}</Text>
          </View>

          <View className="flex-row items-center justify-between py-2 border-t border-slate-50">
            <Text className="text-[12.5px] text-slate-500">Email Address</Text>
            <Text className="text-[12.5px] font-medium text-slate-700">{parent?.email || "N/A"}</Text>
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
