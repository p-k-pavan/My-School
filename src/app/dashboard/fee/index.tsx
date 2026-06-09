import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
  

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

          

        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
}