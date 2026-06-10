import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = [
  {
    label: "Home",
    route: "/dashboard",
    icon: (active: boolean) => (
      <FontAwesome name="home" size={20} color={active ? "#1E88E5" : "#94A3B8"} />
    ),
  },
  {
    label: "Fees",
    route: "/dashboard/fee",
    icon: (active: boolean) => (
      <FontAwesome6 name="money-bill" size={18} color={active ? "#1E88E5" : "#94A3B8"} />
    ),
  },
  {
    label: "Feed",
    route: "/dashboard/feed",
    icon: (active: boolean) => (
      <FontAwesome name="comment" size={18} color={active ? "#1E88E5" : "#94A3B8"} />
    ),
  },
  {
    label: "Profile",
    route: "/dashboard/profile",
    icon: (active: boolean) => (
      <Ionicons name="person" size={20} color={active ? "#1E88E5" : "#94A3B8"} />
    ),
  },
];

export default function Footer() {
  const pathname = usePathname();

  const activeTab = TABS.reduce((bestTab, currentTab) => {
    const isMatch = pathname === currentTab.route || pathname.startsWith(currentTab.route + "/");
    if (!isMatch) return bestTab;
    if (!bestTab) return currentTab;
    return currentTab.route.length > bestTab.route.length ? currentTab : bestTab;
  }, null as typeof TABS[number] | null);

  return (
    <SafeAreaView
      edges={["bottom"]}
       style={{
        paddingVertical: 0,
      }}
      className="bg-white border-t border-slate-200"
    >
      <View className="flex-row justify-around items-center px-2 pt-2 pb-1">
        {TABS.map((tab) => {
          const active = activeTab?.route === tab.route;
          return (
            <Pressable
              key={tab.route}
               onPress={() => router.push(tab.route as any)}
              className="flex-1 items-center py-1 gap-1"
              android_ripple={{ color: "#E0E7FF", borderless: true, radius: 32 }}
            >
              {tab.icon(active) }
              <Text
                className={`text-[10px] font-medium tracking-tight ${
                  active ? "text-[#1E88E5]" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
             
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}