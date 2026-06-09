import { AntDesign, FontAwesome, FontAwesome6, Fontisto, Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Fees() {
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
                    <View className="bg-white rounded-2xl p-3.5  border border-blue-100 my-4"
                        style={{ shadowColor: "#1E88E5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
                        <View className="flex-row justify-between items-center">
                            <View className="w-32 h-32 px-4 rounded-xl items-center justify-center shrink-0">
                                <Image
                                    source={require("@/assets/images/wallet.png")}
                                    style={{ width: 64, height: 64 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-slate-500 mt-1 font-medium" >
                                    Total Fees 2026-27
                                </Text>
                                <View className="flex-row items-center justify-between mt-1 pr-4">
                                    <Text className="text-[22px] font-bold text-blue-900">₹ 45,000</Text>
                                    <Pressable className="bg-[#1E88E5] px-3 py-1.5 rounded-lg active:opacity-80">
                                        <Text className="text-white text-[11px] font-semibold">View</Text>
                                    </Pressable>
                                </View>
                            </View>

                        </View>

                    </View>


                    <View className="flex-row flex-wrap gap-2 mb-4">

                        <View className="bg-white rounded-xl p-3.5 items-center border border-slate-100" style={{ width: "48.5%" }}>
                            <View className={`w-16 h-16 bg-green-50 rounded-full items-center justify-center shrink-0 mb-2.5`}>
                                <Fontisto name="wallet" size={24} color="green" />
                            </View>

                            <Text className="text-[12px] text-slate-400 mt-0.5">Total Paid</Text>
                            <Text className="text-[22px] font-bold text-green-600">₹ 35,000</Text>

                        </View>
                        <View className="bg-white rounded-xl p-3.5 border items-center border-slate-100" style={{ width: "48.5%" }}>
                            <View className={`w-16 h-16 bg-orange-50 rounded-full items-center justify-center shrink-0 mb-2.5`}>
                                <FontAwesome name="calendar" size={24} color="orange" />
                            </View>

                            <Text className="text-[12px] text-slate-400 mt-0.5">Due Amount</Text>
                            <Text className="text-[22px] font-bold text-orange-400">₹ 15,000</Text>

                        </View>
                    </View>


                    <View className="bg-red-50 rounded-2xl p-4  border border-red-100 mb-4"
                        style={{ shadowColor: "#1E88E5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
                        <View className="flex-row items-center gap-6">
                            <View className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center shrink-0">
                                <FontAwesome6 name="circle-exclamation" size={24} color="red" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[15px] font-semibold text-red-600">Payment Due</Text>
                                <Text className="text-[12px] text-slate-500 mt-1 leading-5">
                                    The next installment of  ₹ 15,000 is due on 30th Sep 2026.
                                </Text>
                            </View>
                            <Pressable className="bg-red-500 px-3 py-1.5 rounded-lg active:opacity-80">
                                <Text className="text-white text-[11px] font-semibold">Pay Now</Text>
                            </Pressable>
                        </View>

                    </View>


                    <View className="bg-white rounded-2xl p-3.5  border border-blue-100 my-4"
                        style={{ shadowColor: "#1E88E5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-[14px] text-slate-500 mt-1 font-medium" >
                                Last Payment
                            </Text>
                            <Text className="text-[12px] text-slate-400 mt-0.5">Paid on 15th Aug 2026</Text>
                        </View>
                        <View className="flex-row items-center justify-between mt-1 pr-4">
                            <Text className="text-[22px] font-bold text-blue-900">₹ 20,000</Text>
                            <Pressable className="bg-[#1E88E5] px-3 py-1.5 rounded-lg active:opacity-80">
                                <Text className="text-white text-[11px] font-semibold">View Receipt</Text>
                            </Pressable>
                        </View>
                    </View>


                </View>
            </ScrollView>


        </SafeAreaView>
    );
}