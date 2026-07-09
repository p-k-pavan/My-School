import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

interface AttendanceHeaderProps {
    studentName: string;
    className: string;
    rollNo: string;
    openDrawer: () => void;
}

export default function AttendanceHeader({
    studentName,
    className,
    rollNo,
    openDrawer
}: AttendanceHeaderProps) {
    return (
        <View className="bg-[#1E88E5] rounded-b-[32px] flex-row justify-between items-center px-4 pt-10 pb-10">
            <View className="flex-row gap-3 items-center">
                <Pressable onPress={openDrawer}>
                    <AntDesign name="menu-unfold" size={24} color="white" />
                </Pressable>
                <View>
                    <Text className="text-[17px] font-bold text-white">
                        {studentName}
                    </Text>
                    <Text className="text-[12px] text-white/70 mt-0.5">
                        Class {className}  •  Roll No: {rollNo}
                    </Text>
                </View>
            </View>
            <View className="flex-row gap-3 items-center">
                <View className="relative">
                    <Ionicons name="notifications-outline" size={26} color="white" />
                    <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E88E5]" />
                </View>
                <Image
                    source={require("@/assets/images/user.png")}
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        borderWidth: 2,
                        borderColor: "white",
                    }}
                />
            </View>
        </View>
    );
}
