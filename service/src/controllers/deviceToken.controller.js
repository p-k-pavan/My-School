import { DeviceToken } from "../models/deviceToken.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// Register or update a device token
export const registerDeviceToken = asyncHandler(async (req, res) => {
    const { token, platform, deviceId, deviceName, appVersion, osVersion } = req.body;

    if (!token || !platform || !deviceId) {
        throw new AppError("Token, platform, and deviceId are required", 400);
    }

    if (!["android", "ios"].includes(platform)) {
        throw new AppError("Platform must be android or ios", 400);
    }

    // Upsert the device token based on deviceId to handle user switches or token updates on the same device
    const deviceToken = await DeviceToken.findOneAndUpdate(
        { deviceId },
        {
            userId: req.user.id,
            token,
            platform,
            deviceName: deviceName || "",
            appVersion: appVersion || "",
            osVersion: osVersion || "",
            isActive: true,
            lastSeenAt: new Date()
        },
        { upsert: true, new: true }
    );

    res.status(200).json({
        success: true,
        message: "Device token registered successfully",
        data: deviceToken
    });
});

// Deactivate device token (e.g. on logout)
export const deactivateDeviceToken = asyncHandler(async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        throw new AppError("deviceId is required to deactivate token", 400);
    }

    // Set token status to inactive
    await DeviceToken.findOneAndUpdate(
        { deviceId },
        { isActive: false }
    );

    res.status(200).json({
        success: true,
        message: "Device token deactivated successfully"
    });
});
