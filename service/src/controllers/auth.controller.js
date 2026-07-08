import { User } from "../models/user.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js";
import generatedOtp from "../utils/generatedOTP.js";
import sendMail from "../config/sendMail.js";
import { createAuditLog } from "./auditLog.controller.js";
import jwt from "jsonwebtoken";

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new AppError("Email is required", 400);
    }

    if (!password) {
        throw new AppError("Password is required", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user._id, user.role);

    createAuditLog({
        userId: user._id,
        role: user.role,
        module: "auth",
        action: "login",
        title: "User Login",
        description: `User ${user.email} logged in successfully`,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
    });

    res
        .status(200)
        .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
            },
        });
});

export const logout = asyncHandler(async (req, res) => {
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            createAuditLog({
                userId: decoded.id,
                role: decoded.role,
                module: "auth",
                action: "logout",
                title: "User Logout",
                description: "User logged out successfully",
                ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });
        } catch (err) {
            // ignore verify error for logging
        }
    }

    res
        .cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(0),
        })
        .status(200)
        .json({
            success: true,
            message: "Logout successful",
        });
});

export const getCurrentUser = asyncHandler(
    async (req, res) => {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            throw new AppError("User not found", 404);
        }

        res.status(200).json({
            success: true,
            user,
        });
    }
);

export const changePassword = asyncHandler(
    async (req, res) => {
        const { password, newPassword } = req.body;

        if (!password || !newPassword) {
            throw new AppError(
                "Old password and new password are required",
                400
            );
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            throw new AppError(
                "Current password is incorrect",
                401
            );
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        await user.save();

        createAuditLog({
            userId: user._id,
            role: user.role,
            module: "user",
            action: "update",
            title: "Password Changed",
            description: "User changed password",
            ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
);

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError("Email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const otp = generatedOtp().toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = otpExpires;
    user.isResetOtpVerified = false;
    await user.save();

    const subject = "Password Reset OTP";
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 2px; margin: 15px 0;">
                ${otp}
            </div>
            <p>This OTP is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
        </div>
    `;

    try {
        await sendMail(email, subject, htmlContent);
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw new AppError("Failed to send OTP email. Please try again later.", 500);
    }

    res.status(200).json({
        success: true,
        message: "OTP sent to your email",
    });
});

export const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new AppError("Email and OTP are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
        throw new AppError("No OTP requested for this user", 400);
    }

    const isExpired = new Date() > new Date(user.resetPasswordOtpExpires);
    const isMatch = user.resetPasswordOtp === otp.toString().trim();

    if (isExpired) {
        throw new AppError("OTP has expired", 400);
    }

    if (!isMatch) {
        throw new AppError("Invalid OTP", 400);
    }

    user.isResetOtpVerified = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: "OTP verified successfully",
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        throw new AppError("Email and new password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!user.isResetOtpVerified) {
        throw new AppError("OTP has not been verified yet", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.isResetOtpVerified = false;
    await user.save();

    createAuditLog({
        userId: user._id,
        role: user.role,
        module: "user",
        action: "update",
        title: "Password Reset",
        description: "User password reset via OTP",
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
        success: true,
        message: "Password reset successful",
    });
});

