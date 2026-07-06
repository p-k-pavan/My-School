import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
} from "@/redux/api/auth";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [sendOtp, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyForgotPasswordOtpMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const res = await sendOtp({ email: email.trim() }).unwrap();
      Alert.alert("Success", res.message || "OTP sent successfully to your email");
      setStep(2);
    } catch (err: any) {
      console.log("Send OTP Error:", err);
      Alert.alert("Error", err.data?.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "OTP is required");
      return;
    }
    if (otp.trim().length !== 6) {
      Alert.alert("Error", "OTP must be 6 digits");
      return;
    }

    try {
      const res = await verifyOtp({ email: email.trim(), otp: otp.trim() }).unwrap();
      Alert.alert("Success", res.message || "OTP verified successfully");
      setStep(3);
    } catch (err: any) {
      console.log("Verify OTP Error:", err);
      Alert.alert("Error", err.data?.message || "Invalid or expired OTP");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "All password fields are required");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const res = await resetPassword({ email: email.trim(), newPassword }).unwrap();
      Alert.alert("Success", res.message || "Password reset successful");
      router.replace("/");
    } catch (err: any) {
      console.log("Reset Password Error:", err);
      Alert.alert("Error", err.data?.message || "Failed to reset password");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await sendOtp({ email: email.trim() }).unwrap();
      Alert.alert("Success", res.message || "OTP resent successfully");
    } catch (err: any) {
      console.log("Resend OTP Error:", err);
      Alert.alert("Error", err.data?.message || "Failed to resend OTP");
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
          {/* Header Back Button */}
          <View className="flex-row items-center mt-2 mb-6">
            <Pressable
              onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
              className="p-2 -ml-2 rounded-full active:bg-slate-100"
            >
              <Feather name="arrow-left" size={24} color="#1e293b" />
            </Pressable>
            <Text className="text-lg font-bold text-slate-800 ml-2">
              {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
            </Text>
          </View>

          {/* Logo Section */}
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/educonnect-logo.png")}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
            <Text className="text-xl font-bold text-slate-800 mt-3">
              {step === 1 ? "Recover Password" : step === 2 ? "OTP Verification" : "New Password"}
            </Text>
            <Text className="text-sm font-medium text-slate-400 text-center mt-1.5 px-4">
              {step === 1
                ? "Enter your email below and we will send you a 6-digit OTP code to reset your password"
                : step === 2
                ? `Please enter the 6-digit OTP code sent to ${email}`
                : "Choose a strong password with at least 6 characters"}
            </Text>
          </View>

          {/* Step 1: Input Email */}
          {step === 1 && (
            <View className="gap-5">
              <View className="flex-row items-center bg-white border border-slate-200 rounded-[22px] px-4 py-4 shadow-sm">
                <Feather name="mail" size={20} color="#2563eb" className="mr-3" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[15px] font-medium text-slate-800 p-0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isSendingOtp}
                />
              </View>

              <Pressable
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                className={`flex-row items-center justify-center bg-blue-600 rounded-[22px] py-4 mt-4 shadow-md shadow-blue-200 active:opacity-90 ${
                  isSendingOtp ? "opacity-70" : ""
                }`}
              >
                {isSendingOtp ? (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                ) : (
                  <Feather name="send" size={18} color="white" className="mr-2.5" />
                )}
                <Text className="text-white text-[16px] font-bold">
                  {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Step 2: Input OTP */}
          {step === 2 && (
            <View className="gap-5">
              <View className="flex-row items-center bg-white border border-slate-200 rounded-[22px] px-4 py-4 shadow-sm">
                <Feather name="shield" size={20} color="#2563eb" className="mr-3" />
                <TextInput
                  value={otp}
                  onChangeText={(val) => setOtp(val.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="Enter 6-Digit OTP"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  className="flex-1 text-[16px] font-mono font-bold tracking-widest text-slate-800 p-0"
                  editable={!isVerifyingOtp}
                />
              </View>

              <View className="flex-row items-center justify-between px-2 mt-1">
                <Pressable onPress={handleResendOtp} disabled={isSendingOtp || isVerifyingOtp}>
                  <Text className="text-sm font-bold text-blue-600">
                    {isSendingOtp ? "Resending..." : "Resend OTP"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setStep(1)} disabled={isVerifyingOtp}>
                  <Text className="text-sm font-bold text-slate-500">Change Email</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className={`flex-row items-center justify-center bg-blue-600 rounded-[22px] py-4 mt-2 shadow-md shadow-blue-200 active:opacity-90 ${
                  isVerifyingOtp ? "opacity-70" : ""
                }`}
              >
                {isVerifyingOtp ? (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                ) : (
                  <Feather name="check-circle" size={18} color="white" className="mr-2.5" />
                )}
                <Text className="text-white text-[16px] font-bold">
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Step 3: Input New Password */}
          {step === 3 && (
            <View className="gap-5">
              {/* New Password Input */}
              <View className="flex-row items-center bg-white border border-slate-200 rounded-[22px] px-4 py-4 shadow-sm">
                <Feather name="lock" size={20} color="#2563eb" className="mr-3" />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New Password"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[15px] font-medium text-slate-800 p-0"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  editable={!isResettingPassword}
                />
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-1">
                  <Feather
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#64748b"
                  />
                </Pressable>
              </View>

              {/* Confirm Password Input */}
              <View className="flex-row items-center bg-white border border-slate-200 rounded-[22px] px-4 py-4 shadow-sm">
                <Feather name="lock" size={20} color="#2563eb" className="mr-3" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[15px] font-medium text-slate-800 p-0"
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                  editable={!isResettingPassword}
                />
                <Pressable
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  className="p-1"
                >
                  <Feather
                    name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#64748b"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleResetPassword}
                disabled={isResettingPassword}
                className={`flex-row items-center justify-center bg-blue-600 rounded-[22px] py-4 mt-2 shadow-md shadow-blue-200 active:opacity-90 ${
                  isResettingPassword ? "opacity-70" : ""
                }`}
              >
                {isResettingPassword ? (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                ) : (
                  <Feather name="lock" size={18} color="white" className="mr-2.5" />
                )}
                <Text className="text-white text-[16px] font-bold">
                  {isResettingPassword ? "Resetting Password..." : "Reset Password"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Footer Spacer illustration */}
          <View className="mt-auto items-center py-6">
            <Image
              source={require("@/assets/images/school-illustration.png")}
              style={{ width: "100%", height: 180, alignSelf: "center" }}
              resizeMode="contain"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
