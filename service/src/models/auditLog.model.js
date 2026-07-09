import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["admin", "management", "teacher", "parent", "system"],
            required: true,
            index: true,
        },

        module: {
            type: String,
            enum: [
                "auth",
                "admission",
                "student",
                "parent",
                "teacher",
                "class",
                "attendance",
                "homework",
                "feed",
                "fees",
                "fee_structure",
                "fee_transaction",
                "timetable",
                "subject",
                "notification",
                "device_token",
                "user",
                "settings",
            ],
            required: true,
            index: true,
        },

        action: {
            type: String,
            enum: [
                "create",
                "update",
                "delete",
                "mark",
                "publish",
                "unpublish",
                "pin",
                "unpin",
                "submit",
                "approve",
                "reject",
                "payment",
                "assign",
                "unassign",
                "activate",
                "deactivate",
                "login",
                "logout",
                "send",
                "download",
            ],
            required: true,
            index: true,
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
        },

        entityType: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },

        entityCode: {
            type: String,
            default: "",
            trim: true,
            maxlength: 100,
        },

        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        title: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000,
        },

        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        oldValues: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        newValues: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        status: {
            type: String,
            enum: ["success", "failed"],
            default: "success",
            index: true,
        },

        isSensitive: {
            type: Boolean,
            default: false,
            index: true,
        },

        ipAddress: {
            type: String,
            default: "",
        },

        userAgent: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        minimize: false,
    }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityId: 1, createdAt: -1 });
auditLogSchema.index({ role: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);