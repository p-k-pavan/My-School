import React from "react";
import { Text, View } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

const OVERVIEW = [
  {
    icon: <FontAwesome6 name="book-open" size={18} color="#1E88E5" />,
    bg: "bg-blue-50",
    value: "3",
    label: "Homework due",
    badge: "2 pending",
    badgeColor: "bg-red-50 text-red-700",
  },
  {
    icon: <Ionicons name="stats-chart" size={18} color="#16A34A" />,
    bg: "bg-green-50",
    value: "87%",
    label: "Attendance",
    badge: "Good",
    badgeColor: "bg-green-50 text-green-700",
  },
  {
    icon: <FontAwesome6 name="money-bill" size={16} color="#D97706" />,
    bg: "bg-amber-50",
    value: "₹4,500",
    label: "Fee due",
    badge: "Oct 1",
    badgeColor: "bg-amber-50 text-amber-800",
  },
  {
    icon: <Ionicons name="star" size={18} color="#7C3AED" />,
    bg: "bg-violet-50",
    value: "A+",
    label: "Last result",
    badge: "Top 5%",
    badgeColor: "bg-violet-50 text-violet-700",
  },
];

export default function Overview() {
  return (
    <>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[15px] font-semibold text-slate-800">
          Overview
        </Text>
        <Text className="text-[13px] text-[#1E88E5]">12 Sep 2026</Text>
      </View>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {OVERVIEW.map((item, i) => (
          <View
            key={i}
            className="bg-white rounded-xl p-3.5 border border-slate-100"
            style={{ width: "48.5%" }}
          >
            <View
              className={`w-9 h-9 ${item.bg} rounded-lg items-center justify-center mb-2.5`}
            >
              {item.icon}
            </View>
            <Text className="text-[22px] font-bold text-slate-800">
              {item.value}
            </Text>
            <Text className="text-[12px] text-slate-400 mt-0.5">
              {item.label}
            </Text>
            <View
              className={`self-start mt-2 px-2 py-0.5 rounded-full ${item.badgeColor}`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  item.badgeColor.split(" ")[1]
                }`}
              >
                {item.badge}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
