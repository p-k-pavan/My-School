import AuthLayout from "@/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import {
    useForgotPasswordMutation,
    useVerifyForgotPasswordOtpMutation,
    useResetPasswordMutation
} from "@/redux/api/auth";
import { useNavigate } from "react-router";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [sendOtp, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyForgotPasswordOtpMutation();
    const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            const res = await sendOtp({ email: email.trim() }).unwrap();
            toast.success(res.message || "OTP sent successfully");
            setStep(2);
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Failed to send OTP. Please try again.");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            toast.error("OTP is required");
            return;
        }
        if (otp.trim().length !== 6) {
            toast.error("OTP must be 6 digits");
            return;
        }

        try {
            const res = await verifyOtp({ email: email.trim(), otp: otp.trim() }).unwrap();
            toast.success(res.message || "OTP verified successfully");
            setStep(3);
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Invalid or expired OTP");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const { newPassword, confirmPassword } = passwords;

        if (!newPassword || !confirmPassword) {
            toast.error("All password fields are required");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const res = await resetPassword({ email: email.trim(), newPassword }).unwrap();
            toast.success(res.message || "Password reset successful");
            navigate("/");
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Failed to reset password. Please try again.");
        }
    };

    const handleResendOtp = async () => {
        try {
            const res = await sendOtp({ email: email.trim() }).unwrap();
            toast.success(res.message || "OTP resent successfully");
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Failed to resend OTP");
        }
    };

    return (
        <AuthLayout
            title={
                step === 1 ? "Forgot Password" :
                step === 2 ? "Verify OTP" :
                "Reset Password"
            }
            description={
                step === 1 ? "Enter your email to receive a password reset OTP" :
                step === 2 ? `Enter the 6-digit OTP sent to ${email}` :
                "Choose a strong new password for your account"
            }
        >
            <CardContent>
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jordan@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSendingOtp}
                                />
                            </Field>
                        </FieldGroup>
                        <div className="flex items-center justify-between">
                            <Button
                                variant="link"
                                className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary cursor-pointer"
                                type="button"
                                onClick={() => navigate("/")}
                                disabled={isSendingOtp}
                            >
                                Back to Login
                            </Button>
                            <Button
                                type="submit"
                                className="px-8 cursor-pointer"
                                disabled={isSendingOtp}
                            >
                                {isSendingOtp ? "Sending..." : "Send OTP"}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="otp">Enter 6-Digit OTP</FieldLabel>
                                <Input
                                    id="otp"
                                    type="text"
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    disabled={isVerifyingOtp}
                                    className="text-center font-mono tracking-widest text-lg"
                                />
                            </Field>
                        </FieldGroup>
                        <div className="flex items-center justify-between">
                            <Button
                                variant="link"
                                className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary cursor-pointer"
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isSendingOtp || isVerifyingOtp}
                            >
                                {isSendingOtp ? "Resending..." : "Resend OTP"}
                            </Button>
                            <Button
                                type="submit"
                                className="px-8 cursor-pointer"
                                disabled={isVerifyingOtp}
                            >
                                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </div>
                        <div className="text-center mt-2">
                            <Button
                                variant="link"
                                className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={isVerifyingOtp}
                            >
                                Change Email
                            </Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="********"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                    disabled={isResettingPassword}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="********"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    disabled={isResettingPassword}
                                />
                            </Field>
                        </FieldGroup>
                        <div className="flex items-center justify-end">
                            <Button
                                type="submit"
                                className="w-full cursor-pointer py-2"
                                disabled={isResettingPassword}
                            >
                                {isResettingPassword ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </AuthLayout>
    );
}
