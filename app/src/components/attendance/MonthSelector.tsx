import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MonthSelectorProps {
    formattedMonthName: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export default function MonthSelector({
    formattedMonthName,
    onPrevMonth,
    onNextMonth
}: MonthSelectorProps) {
    return (
        <View className="bg-white rounded-2xl p-4 border border-blue-50/50 mt-4 flex-row justify-between items-center shadow-sm">
            <TouchableOpacity onPress={onPrevMonth} className="p-2 rounded-full bg-slate-50 border border-slate-100 active:bg-slate-100">
                <Ionicons name="chevron-back" size={20} color="#1E88E5" />
            </TouchableOpacity>
            <View className="items-center">
                <Text className="text-[15px] font-extrabold text-blue-900 tracking-wide uppercase">{formattedMonthName}</Text>
            </View>
            <TouchableOpacity onPress={onNextMonth} className="p-2 rounded-full bg-slate-50 border border-slate-100 active:bg-slate-100">
                <Ionicons name="chevron-forward" size={20} color="#1E88E5" />
            </TouchableOpacity>
        </View>
    );
}
