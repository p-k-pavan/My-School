import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { AuditLog } from "../models/auditLog.model.js";
import { User } from "../models/user.model.js";

export const createAuditLog = async ({
    userId,
    role,
    module,
    action,
    entityId = null,
    entityType = "",
    entityCode = "",
    targetUserId = null,
    title = "",
    description = "",
    meta = {},
    oldValues = null,
    newValues = null,
    status = "success",
    isSensitive = false,
    ipAddress = "",
    userAgent = "",
}) => {
    try {
        return await AuditLog.create({
            userId,
            role,
            module,
            action,
            entityId,
            entityType,
            entityCode,
            targetUserId,
            title,
            description,
            meta,
            oldValues,
            newValues,
            status,
            isSensitive,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error("Audit log creation failed:", error);
        return null;
    }
};

export const getAuditLogs = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        module,
        action,
        userId,
        startDate,
        endDate,
        search,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (module) filter.module = module;
    if (action) filter.action = action;

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid userId", 400);
        }
        filter.userId = userId;
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }).select("_id").lean();

        const userIds = matchingUsers.map(user => user._id);

        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];

        if (userIds.length > 0) {
            filter.$or.push({ userId: { $in: userIds } });
        }
    }

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .populate("userId", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean(),

        AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        message: "Audit Log fetched successfully",
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        logs,
    });
});

export const downloadAuditLogs = asyncHandler(async (req, res) => {
    const {
        module,
        action,
        userId,
        startDate,
        endDate,
        search,
        range,
    } = req.query;

    const filter = {};

    if (module) filter.module = module;
    if (action) filter.action = action;

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid userId", 400);
        }
        filter.userId = userId;
    }

    let calculatedStartDate = null;
    const now = new Date();

    if (range) {
        switch (range) {
            case "1day":
                calculatedStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case "7days":
                calculatedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "15days":
                calculatedStartDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
                break;
            case "1month":
                calculatedStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                throw new AppError("Invalid history range. Supported ranges: 1day, 7days, 15days, 1month", 400);
        }
    }

    if (calculatedStartDate) {
        filter.createdAt = { $gte: calculatedStartDate };
    } else if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }).select("_id").lean();

        const userIds = matchingUsers.map(user => user._id);

        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];

        if (userIds.length > 0) {
            filter.$or.push({ userId: { $in: userIds } });
        }
    }

    const filename = `audit-logs-${range || "export"}-${now.toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return "";
        let str = "";
        if (typeof val === "object") {
            if (val instanceof Date) {
                str = val.toISOString();
            } else if (typeof val.toHexString === "function") {
                str = val.toHexString();
            } else {
                str = JSON.stringify(val);
            }
        } else {
            str = String(val);
        }

        str = str.replace(/"/g, '""');
        if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
            return `"${str}"`;
        }
        return str;
    };

    const headers = [
        "Log ID",
        "Timestamp",
        "User Name",
        "User Email",
        "User Role",
        "Module",
        "Action",
        "Entity ID",
        "Entity Type",
        "Entity Code",
        "Target User ID",
        "Title",
        "Description",
        "Status",
        "Is Sensitive",
        "IP Address",
        "User Agent"
    ];
    res.write(headers.join(",") + "\n");

    const cursor = AuditLog.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .cursor();

    for (let log = await cursor.next(); log != null; log = await cursor.next()) {
        const row = [
            log._id,
            log.createdAt ? log.createdAt.toISOString() : "",
            log.userId ? log.userId.name : "System / Unknown",
            log.userId ? log.userId.email : "",
            log.role || "",
            log.module || "",
            log.action || "",
            log.entityId || "",
            log.entityType || "",
            log.entityCode || "",
            log.targetUserId || "",
            log.title || "",
            log.description || "",
            log.status || "",
            log.isSensitive ? "Yes" : "No",
            log.ipAddress || "",
            log.userAgent || ""
        ];
        res.write(row.map(escapeCSV).join(",") + "\n");
    }

    res.end();
});


export const getAuditLogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid audit log ID", 400);
    }

    const log = await AuditLog.findById(id)
        .populate("userId", "name email role")
        .lean();

    if (!log) {
        throw new AppError("Audit log not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Audit Log fetched successfully",
        log,
    });
});