import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { DeviceToken } from "../models/deviceToken.model.js";

export const registerDeviceToken = asyncHandler(async (req, res) => {
    const {
        token,
        platform,
        deviceId,
        deviceName,
        appVersion,
        osVersion,
    } = req.body;

    if (!token || !platform || !deviceId) {
        throw new AppError(
            "Token, platform and deviceId are required",
            400
        );
    }

    if (!["android", "ios"].includes(platform)) {
        throw new AppError(
            "Platform must be android or ios",
            400
        );
    }

    let device = await DeviceToken.findOne({
        $or: [
            {
                token,
            },
            {
                userId: req.user.id,
                deviceId,
            },
        ],
    });

    if (device) {
        device.userId = req.user.id;
        device.token = token;
        device.platform = platform;
        device.deviceName = deviceName || "";
        device.appVersion = appVersion || "";
        device.osVersion = osVersion || "";
        device.lastSeenAt = new Date();
        device.isActive = true;

        await device.save();
    } else {
        device = await DeviceToken.create({
            userId: req.user.id,
            token,
            platform,
            deviceId,
            deviceName: deviceName || "",
            appVersion: appVersion || "",
            osVersion: osVersion || "",
        });
    }

    res.status(200).json({
        success: true,
        message: "Device registered successfully.",
        data: device,
    });
});

export const deactivateDeviceToken = asyncHandler(async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        throw new AppError(
            "Device ID is required",
            400
        );
    }

    const device = await DeviceToken.findOneAndUpdate(
        {
            userId: req.user.id,
            deviceId,
        },
        {
            isActive: false,
            lastSeenAt: new Date(),
        },
        {
            returnDocument: "after",
        }
    );

    if (!device) {
        throw new AppError(
            "Device not found",
            404
        );
    }

    res.status(200).json({
        success: true,
        message: "Device deactivated successfully.",
    });
});