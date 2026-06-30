import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { Notification } from "../models/notification.model.js";

export const createNotification = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        type,
        receiverType,
        receiverIds,
        targetClasses,
        entityId,
        expiresAt,
    } = req.body;

    if (!title || !description) {
        throw new AppError("Title and description are required.", 400);
    }

    if (
        receiverType === "classes" &&
        (!targetClasses || targetClasses.length === 0)
    ) {
        throw new AppError(
            "Please select at least one class.",
            400
        );
    }

    if (
        receiverType === "individual_users" &&
        (!receiverIds || receiverIds.length === 0)
    ) {
        throw new AppError(
            "Please select at least one user.",
            400
        );
    }

    const notification = await Notification.create({
        title,
        description,
        type,
        receiverType,
        receiverIds,
        targetClasses,
        entityId,
        expiresAt,
        createdBy: req.user.id,
    });


    res.status(201).json({
        success: true,
        message: "Notification created successfully.",
        data: notification,
    });
});

export const getNotifications = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.type) {
        query.type = req.query.type;
    }

    if (req.query.status) {
        query.status = req.query.status;
    }

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .populate("createdBy", "name")
            .sort({
                isPinned: -1,
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Notification.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        count: notifications.length,
        data: notifications,
    });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new AppError(
            "Invalid notification id.",
            400
        );
    }

    const notification =
        await Notification.findById(notificationId);

    if (!notification) {
        throw new AppError(
            "Notification not found.",
            404
        );
    }

    await notification.deleteOne();

    res.status(200).json({
        success: true,
        message: "Notification deleted successfully.",
    });
});