import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        platform: {
            type: String,
            enum: ["android", "ios"],
            required: true,
        },

        deviceId: {
            type: String,
            required: true,
            trim: true,
        },

        deviceName: {
            type: String,
            default: "",
            trim: true,
        },

        appVersion: {
            type: String,
            default: "",
        },

        osVersion: {
            type: String,
            default: "",
        },

        lastSeenAt: {
            type: Date,
            default: Date.now,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

deviceTokenSchema.index(
    { userId: 1, deviceId: 1 },
    { unique: true }
);

deviceTokenSchema.index({
    userId: 1,
    isActive: 1,
});

export const DeviceToken = mongoose.model(
    "DeviceToken",
    deviceTokenSchema
);