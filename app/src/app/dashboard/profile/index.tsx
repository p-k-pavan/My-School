import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";



export default function Profile() {
    return (
        <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
            <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

                <View className="flex-row items-center justify-between px-4 py-3">
                    <Text className="text-[18px] font-bold text-blue-900">Profile</Text>
                    <View className="relative">
                        <Ionicons name="notifications-outline" size={22} color="black" />
                        <View className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1E88E5]" />
                    </View>
                </View>

                <View className="px-3">

                    <View className="bg-white rounded-2xl p-2  border border-blue-100 my-4"
                        style={{ shadowColor: "#1E88E5", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
                        <Text className="text-[12px] text-slate-500 mt-1 font-medium pl-2" >
                            Switch Account
                        </Text>

                        <View className="flex-row items-center gap-3 bg-blue-50 rounded-2xl p-1 mt-1 border border-blue-100 ">
                            <View className="w-16 h-16 px-4 rounded-xl items-center justify-center shrink-0">
                                <Image
                                    source={require("@/assets/images/user.png")}
                                    style={{ width: 36, height: 36, borderRadius: 32 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <View className="flex-row items-center justify-between flex-1 pr-4">
                                <View>
                                    <Text className="text-[14px] font-bold text-blue-900">John Doe</Text>
                                    <Text className="text-[12px] text-slate-500 mt-0.5">Class 10A  •  Roll No: 123</Text>
                                </View>
                                <Pressable className="bg-[#1E88E5] p-1 rounded-full active:opacity-80">
                                    <AntDesign name="caret-down" size={18} color="white" />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-2xl   border border-blue-100 mb-4">
                        <View className="flex-row items-center gap-4 p-4">
                            <View className="w-32 h-32 px-4 rounded-xl items-center justify-center shrink-0 relative">
                                <Image
                                    source={require("@/assets/images/user.png")}
                                    style={{ width: 96, height: 96, borderRadius: 48 }}
                                    resizeMode="contain"
                                />
                                <View className="absolute bottom-2 right-2  bg-white p-1 rounded-full">
                                    <Ionicons name="camera" size={24} color="blue" />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[18px] font-bold text-blue-900">John Doe</Text>
                                <Text className="text-[14px] text-slate-500 mt-1">
                                    Student ID: 12345
                                </Text>
                                 <View className="bg-blue-50 px-3 py-1 rounded-full border max-w-22 border-blue-100 mb-1">
                  <Text className="text-[12px] text-blue-700 font-semibold">Class 10A</Text>
                </View>
                            </View>
                        </View>

                        <View className="bg-white rounded-2xl   p-4 border border-blue-100">
                        <View className="flex-row items-center gap-4">
                            <MaterialIcons name="person" size={24} color="blue" />
                            <Text className="text-[14px] font-medium text-blue-900">Student Details</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3">
                            <Text className="text-[12px] text-slate-500">Date of Birth</Text>
                            <Text className="text-[12px] text-slate-500">15/06/2005</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                            <Text className="text-[12px] text-slate-500">Blood Group</Text>
                            <Text className="text-[12px] text-slate-500">O+</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                            <Text className="text-[12px] text-slate-500">Address</Text>
                            <Text className="text-[12px] text-slate-500">123, Main Street, City</Text>
                        </View>

                    </View>
                        </View>

                    <View className="bg-white rounded-2xl p-4  border border-blue-100 mb-4">
                        <View className="flex-row items-center gap-4">
                            <MaterialIcons name="people" size={24} color="blue" />
                            <Text className="text-[14px] font-medium text-blue-900">Parents/Guardians</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3">
                            <Text className="text-[12px] text-slate-500">Father Name</Text>
                            <Text className="text-[12px] text-slate-500">Raj Kumar</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                            <Text className="text-[12px] text-slate-500">Mother Name</Text>
                            <Text className="text-[12px] text-slate-500">Priya Kumari</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                            <Text className="text-[12px] text-slate-500">Phone Number</Text>
                            <Text className="text-[12px] text-slate-500">+91 897 123 4567</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                            <Text className="text-[12px] text-slate-500">Email Address</Text>
                            <Text className="text-[12px] text-slate-500">raj.kumar@gmail.com</Text>
                        </View>

                    </View>


                    <View className="bg-white rounded-2xl p-4  border border-blue-100 mb-4">
                        <View className="flex-row items-center gap-4">
                            <Ionicons name="settings-outline" size={24} color="blue" />
                            <Text className="text-[14px] font-medium text-blue-900">Settings</Text>
                        </View>

                        <View className="flex-row items-center justify-between mt-3 ">
                            <View className="flex-row items-center gap-2">
                                <AntDesign name="login" size={16} color="red" />
                                <Text className="text-[12px] text-slate-500">Logout</Text>
                            </View>
                            
                            <AntDesign name="right-circle" size={18} color="gray" />
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="contact-support" size={18} color="black" />
                                <Text className="text-[12px] text-slate-500">Contact Support</Text>
                            </View>
                            <AntDesign name="right-circle" size={18} color="gray" />
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                             <View className="flex-row items-center gap-2">
                                <MaterialIcons name="notifications-none" size={18} color="blue" />
                                <Text className="text-[12px] text-slate-500">Notifications</Text>
                            </View>
                            <AntDesign name="right-circle" size={18} color="gray" />
                        </View>

                        <View className="flex-row items-center justify-between mt-3 border-t border-slate-100 pt-3">
                             <View className="flex-row items-center gap-2">
                                <MaterialIcons name="password" size={18} color="green" />
                                <Text className="text-[12px] text-slate-500">Change Password</Text>
                            </View>
                            <AntDesign name="right-circle" size={18} color="gray" />
                        </View>

                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    );
}