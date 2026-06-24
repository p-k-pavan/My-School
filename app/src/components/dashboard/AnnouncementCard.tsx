import React from "react";
import { Pressable, Text, View } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

export default function AnnouncementCard() {
  return (
    <View
      className="bg-white rounded-2xl p-3.5 -mt-6 border border-blue-100 mb-4"
      style={{
        shadowColor: "#1E88E5",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-start gap-2.5">
        <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center shrink-0">
          <FontAwesome6 name="bullhorn" size={16} color="#1E88E5" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-blue-900">
            Important announcement
          </Text>
          <Text
            className="text-[12px] text-slate-500 mt-1 leading-5"
            numberOfLines={2}
          >
            School will be closed on Friday, 15th September for a public holiday.
          </Text>
        </View>
        <Pressable className="bg-[#1E88E5] px-3 py-1.5 rounded-lg active:opacity-80">
          <Text className="text-white text-[11px] font-semibold">View</Text>
        </Pressable>
      </View>
      <View className="flex-row items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
        <Ionicons name="time-outline" size={11} color="#94a3b8" />
        <Text className="text-[10px] text-slate-400">Today, 9:00 AM</Text>
        <View className="w-1 h-1 rounded-full bg-slate-200 mx-0.5" />
        <Text className="text-[10px] text-slate-400">All classes</Text>
      </View>
    </View>
  );
}
