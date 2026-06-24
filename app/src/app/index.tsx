import { Feather, FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login as loginAction } from "@/redux/reducer/authReducer";
import { useLoginMutation } from "@/redux/api/auth";

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [loginMutation, { isLoading }] = useLoginMutation();

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (!password) {
      Alert.alert("Error", "Password is required");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const res = await loginMutation({ email: email.trim(), password }).unwrap();
      dispatch(loginAction({ user: res.user, token: res.token }));
      Alert.alert("Success", "Login successful");
    } catch (err: any) {
      console.log("Login error:", err);
      let errorMessage = "Something went wrong";

      if (err.status) {
        switch (err.status) {
          case 401:
            errorMessage = "Invalid email or password";
            break;
          case 404:
            errorMessage = "Email not registered";
            break;
          case 500:
            errorMessage = "Server error, please try again later";
            break;
          default:
            errorMessage = err.data?.message || "Failed to log in";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>


      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6"
        >
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/educonnect-logo.png")}
              style={{ width: 88, height: 88 }}
              resizeMode="contain"
            />
            <View className="flex-row items-center mt-3">
              <Text className="text-[28px] font-extrabold text-slate-800">Let'S</Text>
              <Text className="text-[28px] font-extrabold text-blue-600">Connect</Text>
            </View>
            <Text className="text-sm font-medium text-slate-400 tracking-wider mt-1">
              School Management System
            </Text>
          </View>

          <View className="items-center mb-6">
            <Text className="text-[26px] font-bold text-slate-800 tracking-tight">
              Welcome Back!
            </Text>
            <Text className="text-[15px] font-medium text-slate-400 mt-1.5">
              Sign in to continue to your account
            </Text>
          </View>



          <View className="gap-4">
            <View className="flex-row items-center bg-white border border-slate-200 rounded-[22px] px-4 py-4 shadow-sm">
              <Feather name="mail" size={20} color="#2563eb" className="mr-3" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={"email"}
                placeholderTextColor="#94a3b8"
                className="flex-1 text-[15px] font-medium text-slate-800 p-0"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>


            <View className="flex-row items-center bg-white border border-slate-200 rounded-[22px] px-4 py-4 shadow-sm">
              <Feather name="lock" size={20} color="#2563eb" className="mr-3" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                className="flex-1 text-[15px] font-medium text-slate-800 p-0"
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-1">
                <Feather
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#64748b"
                />
              </Pressable>
            </View>
          </View>


          <View className="items-end mt-3 mb-6">
            <Pressable>
              <Text className="text-[13px] font-bold text-blue-600">Forgot Password?</Text>
            </Pressable>
          </View>


          <Pressable 
            onPress={handleLogin}
            disabled={isLoading}
            className={`flex-row items-center justify-center bg-blue-600 rounded-[22px] py-4 shadow-md shadow-blue-200 active:opacity-90 ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
            ) : (
              <Feather name="log-in" size={18} color="white" className="mr-2.5" />
            )}
            <Text className="text-white text-[16px] font-bold">
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>


          <View className="flex-row items-center my-7">
            <View className="flex-1 h-[1px] bg-slate-200" />
            <Text className="mx-4 text-[11px] font-bold text-slate-400 tracking-wider">
              OR CONTINUE WITH
            </Text>
            <View className="flex-1 h-[1px] bg-slate-200" />
          </View>

          <View className="flex-row gap-4 mb-6">
            <Pressable className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 rounded-[22px] py-4 shadow-sm active:bg-slate-50">
              <FontAwesome name="google" size={18} color="#ea4335" className="mr-2" />
              <Text className="text-slate-700 text-[14px] font-bold">Google</Text>
            </Pressable>

          </View>

        
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-slate-400 text-[14px] font-semibold">Don't have an account? </Text>
            <Pressable>
              <Text className="text-blue-600 text-[14px] font-bold">Contact your school</Text>
            </Pressable>
          </View>

    
          <View className="mt-auto items-center">
            <Image
              source={require("@/assets/images/school-illustration.png")}
              style={{ width: "100%", height: 260, alignSelf: "center" }}
              resizeMode="cover"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}