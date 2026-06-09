import Footer from "@/components/Footer";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
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

export default function Dashboard() {
  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        {/* ── Header ── */}
        <View className="bg-[#1E88E5] rounded-b-[32px] flex-row justify-between items-center px-4 pt-10 pb-10">
          <View className="flex-row gap-3 items-center">
            <AntDesign name="menu-unfold" size={24} color="white" />
            <View>
              <Text className="text-[17px] font-bold text-white">John Doe</Text>
              <Text className="text-[12px] text-white/70 mt-0.5">Class 10A  •  Roll No: 123</Text>
            </View>
          </View>
          <View className="flex-row gap-3 items-center">
            <View className="relative">
              <Ionicons name="notifications-outline" size={26} color="white" />
              <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E88E5]" />
            </View>
            <Image
              source={require("@/assets/images/user.png")}
              style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: "white" }}
            />
          </View>
        </View>

        <View className="px-3">

          {/* ── Announcement card ── */}
          <View className="bg-white rounded-2xl p-3.5 -mt-6 border border-blue-100 mb-4"
            style={{ shadowColor: "#1E88E5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
            <View className="flex-row items-start gap-2.5">
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center shrink-0">
                <FontAwesome6 name="bullhorn" size={16} color="#1E88E5" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-blue-900">Important announcement</Text>
                <Text className="text-[12px] text-slate-500 mt-1 leading-5" numberOfLines={2}>
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

          {/* ── Overview ── */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[15px] font-semibold text-slate-800">Overview</Text>
            <Text className="text-[13px] text-[#1E88E5]">12 Sep 2026</Text>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {OVERVIEW.map((item, i) => (
              <View key={i} className="bg-white rounded-xl p-3.5 border border-slate-100" style={{ width: "48.5%" }}>
                <View className={`w-9 h-9 ${item.bg} rounded-lg items-center justify-center mb-2.5`}>
                  {item.icon}
                </View>
                <Text className="text-[22px] font-bold text-slate-800">{item.value}</Text>
                <Text className="text-[12px] text-slate-400 mt-0.5">{item.label}</Text>
                <View className={`self-start mt-2 px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  <Text className={`text-[11px] font-semibold ${item.badgeColor.split(" ")[1]}`}>{item.badge}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Today's schedule ── */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[15px] font-semibold text-slate-800">Today's schedule</Text>
            <Text className="text-[13px] text-[#1E88E5]">See all</Text>
          </View>
          {SCHEDULE.map((item, i) => (
            <View key={i} className="bg-white rounded-xl px-4 py-3.5 mb-2 border border-slate-100 flex-row items-center gap-3">
              <View className="w-16">
                <Text className="text-[13px] font-semibold text-slate-700">{item.start}</Text>
                <Text className="text-[12px] text-slate-400 mt-0.5">{item.end}</Text>
              </View>
              <View className="items-center gap-0.5">
                <View className={`w-2.5 h-2.5 rounded-full border-2 ${item.active ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white"}`} />
                <View className={`w-0.5 h-6 ${item.active ? "bg-blue-200" : "bg-slate-100"}`} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-slate-800">{item.subject}</Text>
                <Text className="text-[12px] text-slate-400 mt-0.5">{item.teacher}  •  {item.room}</Text>
                <View className={`self-start mt-1.5 px-2.5 py-0.5 rounded-full ${item.statusColor}`}>
                  <Text className={`text-[11px] font-semibold ${item.statusColor.split(" ")[1]}`}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}

          {/* ── Today's updates ── */}
          <View className="flex-row justify-between items-center mt-2 mb-3">
            <Text className="text-[15px] font-semibold text-slate-800">Today's updates</Text>
            <Text className="text-[13px] text-[#1E88E5]">See all</Text>
          </View>
          {UPDATES.map((item, i) => (
            <View key={i} className="bg-white rounded-xl px-4 py-3.5 mb-2 border border-slate-100 flex-row items-center gap-3">
              <View className={`w-10 h-10 ${item.bg} rounded-xl items-center justify-center shrink-0`}>
                {item.icon}
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-semibold text-slate-800">{item.title}</Text>
                <Text className="text-[12px] text-slate-500 mt-0.5">{item.sub}</Text>
              </View>
              <Text className="text-[12px] text-slate-400 shrink-0">{item.time}</Text>
            </View>
          ))}

        </View>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}