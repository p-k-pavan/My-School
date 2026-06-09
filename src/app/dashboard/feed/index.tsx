import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


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