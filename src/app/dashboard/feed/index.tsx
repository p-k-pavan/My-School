import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OVERVIEW = [
  { icon: <FontAwesome6 name="book-open" size={18} color="#1E88E5" />, bg: "bg-blue-50", value: "3", label: "Homework due", badge: "2 pending", badgeColor: "bg-red-50 text-red-700" },
  { icon: <Ionicons name="stats-chart" size={18} color="#16A34A" />, bg: "bg-green-50", value: "87%", label: "Attendance", badge: "Good", badgeColor: "bg-green-50 text-green-700" },
  { icon: <FontAwesome6 name="money-bill" size={16} color="#D97706" />, bg: "bg-amber-50", value: "₹4,500", label: "Fee due", badge: "Oct 1", badgeColor: "bg-amber-50 text-amber-800" },
  { icon: <Ionicons name="star" size={18} color="#7C3AED" />, bg: "bg-violet-50", value: "A+", label: "Last result", badge: "Top 5%", badgeColor: "bg-violet-50 text-violet-700" },
];

const SCHEDULE = [
  { start: "9:00 AM", end: "9:45 AM", subject: "Mathematics", teacher: "Mr. Sharma", room: "Room 204", status: "Ongoing", statusColor: "bg-blue-50 text-blue-700", active: true },
  { start: "10:00 AM", end: "10:45 AM", subject: "Physics", teacher: "Ms. Priya", room: "Lab 1", status: "Upcoming", statusColor: "bg-slate-100 text-slate-500", active: false },
  { start: "11:00 AM", end: "11:45 AM", subject: "English", teacher: "Ms. Kavya", room: "Room 101", status: "Upcoming", statusColor: "bg-slate-100 text-slate-500", active: false },
];

const UPDATES = [
  { icon: <FontAwesome6 name="book" size={16} color="#1E88E5" />, bg: "bg-blue-50", title: "Maths homework posted", sub: "Chapter 5 — Trigonometry, Ex 5.2", time: "8:30 AM" },
  { icon: <Ionicons name="checkmark" size={18} color="#16A34A" />, bg: "bg-green-50", title: "Attendance marked", sub: "Present for all morning periods", time: "9:05 AM" },
  { icon: <FontAwesome6 name="money-bill" size={15} color="#D97706" />, bg: "bg-amber-50", title: "Fee reminder", sub: "October term fee due in 18 days", time: "Yesterday" },
];

export default function Feed() {
  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        <View className="bg-white rounded-2xl p-3.5 my-auto border border-blue-100"
            style={{ shadowColor: "#1E88E5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-center gap-2.5">
            <Text className="text-[17px] font-bold text-slate-800 mb-3">Coming Soon</Text>
        </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}