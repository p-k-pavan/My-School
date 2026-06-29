import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "announcement",
                "homework",
                "attendance",
                "fees",
                "exam",
                "online_test",
                "gallery",
                "feed",
                "holiday",
                "general",
            ],
            default: "general",
            index: true,
        },

        receiverType: {
            type: String,
            enum: [
                "all",
                "teachers",
                "students",
                "classes",
                "individual_users",
            ],
            default: "all",
            index: true,
        },

        receiverIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        targetClasses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Class",
            },
        ],

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        isPushSent: {
            type: Boolean,
            default: false,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "expired"],
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({
    receiverType: 1,
    status: 1,
    createdAt: -1,
});

notificationSchema.index({
    targetClasses: 1,
});

notificationSchema.index({
    receiverIds: 1,
});

export const Notification = mongoose.model(
    "Notification",
    notificationSchema
);