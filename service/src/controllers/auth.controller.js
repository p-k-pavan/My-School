import { User } from "../models/user.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js";

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

    res
        .status(200)
        .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            },
        });
});

export const logout = asyncHandler(async (req, res) => {
    res
        .cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
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
