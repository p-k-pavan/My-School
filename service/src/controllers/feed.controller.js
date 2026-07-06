import mongoose from "mongoose";
import { FeedPost } from "../models/Feed.model.js";
import { Parent } from "../models/parent.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Class } from "../models/class.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
import { sendPushNotificationsAsync } from "../utils/fcm.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getFileType = (mimeType = "") => {
    if (!mimeType) return "other";

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    if (mimeType === "application/pdf") {
        return "pdf";
    }

    if (
        mimeType === "application/msword" ||
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        return "doc";
    }

    if (
        mimeType === "application/vnd.ms-excel" ||
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
        return "xlsx";
    }

    if (
        mimeType === "application/vnd.ms-powerpoint" ||
        mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
        return "ppt";
    }

    if (mimeType === "text/plain") {
        return "txt";
    }

    return "other";
};

export const handleFeedNotificationAsync = (feed, actorId) => {
    setImmediate(async () => {
        try {

            let userIds = [];

            switch (feed.visibility) {

                case "all": {
                    const parentUserIds = await Parent.distinct("userId", { status: true });
                    const teacherUserIds = await Teacher.distinct("userId", { status: true });
                    userIds = [...parentUserIds, ...teacherUserIds];
                    break;
                }

                case "teachers": {
                    userIds = await Teacher.distinct("userId", { status: true });
                    break;
                }


                case "students": {
                    const parentIds = await Student.distinct("parentId", { status: true });
                    userIds = await Parent.distinct("userId", {
                        _id: { $in: parentIds },
                        status: true,
                    });
                    break;
                }


                case "classes": {
                    const parentIds = await Student.distinct("parentId", {
                        classId: {
                            $in: feed.targetClasses,
                        },
                        status: true,
                    });
                    const parentUserIds = await Parent.distinct(
                        "userId", {
                        _id: { $in: parentIds },
                        status: true,
                    });
                    const teacherUserIds = await Teacher.distinct(
                        "userId", {
                        assignedClasses: {
                            $in: feed.targetClasses
                        },
                        status: true,
                    });
                    userIds = [...parentUserIds, ...teacherUserIds];
                    break;
                }


                case "individual_students": {
                    const parentIds = await Student.distinct("parentId",
                        { _id: { $in: feed.targetStudents } });
                    userIds = await Parent.distinct("userId",
                        { _id: { $in: parentIds }, status: true });
                    break;
                }
                default: return;
            }

            userIds = [
                ...new Set(
                    userIds.map(id => id.toString())
                ),
            ];

            if (!userIds.length)
                return;

            const notification =
                await Notification.create({
                    title: feed.title,
                    description: feed.description,
                    type: "feed",
                    receiverType: feed.visibility,
                    receiverIds: feed.visibility === "individual_students" ? userIds : [],
                    targetClasses: feed.visibility === "classes" ? feed.targetClasses : [],
                    entityId: feed._id,
                    createdBy: actorId,
                });

            sendPushNotificationsAsync({
                title: feed.title,
                body: feed.description,
                userIds,
                data: {
                    type: "feed",
                    feedId: feed._id.toString(),
                    notificationId: notification._id.toString(),
                    action: "publish",
                },

                onSuccess: async () => {
                    await Notification.findByIdAndUpdate(
                        notification._id, { isPushSent: true, }
                    );

                },

            });

            console.log(`Feed notification queued for ${userIds.length} users.`);

        } catch (error) {

            console.error("Feed notification failed", error);

        }
    });
};

// createFeedPost
export const createFeedPost = asyncHandler(async (req, res) => {
    let { title, description, visibility, targetClasses, targetStudents, status = "published", expiresAt, isPinned = false } = req.body;

    if (!title || !description || !visibility) {
        throw new AppError("Title, description, and visibility are required", 400);
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
        throw new AppError("Expiry date must be in the future", 400);
    }

    let parsedTargetClasses = [];
    let parsedTargetStudents = [];

    if (typeof targetClasses === "string") {
        try {
            parsedTargetClasses = JSON.parse(targetClasses);
        } catch (e) {
            throw new AppError("Invalid targetClasses format", 400);
        }
    } else if (Array.isArray(targetClasses)) {
        parsedTargetClasses = targetClasses;
    }

    if (typeof targetStudents === "string") {
        try {
            parsedTargetStudents = JSON.parse(targetStudents);
        } catch (e) {
            throw new AppError("Invalid targetStudents format", 400);
        }
    } else if (Array.isArray(targetStudents)) {
        parsedTargetStudents = targetStudents;
    }

    if (visibility === "classes") {
        if (parsedTargetClasses.length === 0) {
            throw new AppError("Target classes are required for class-scoped posts", 400);
        }

        const classCount = await Class.countDocuments({
            _id: { $in: parsedTargetClasses },
        });

        if (classCount !== parsedTargetClasses.length) {
            throw new AppError("One or more selected classes are invalid", 400);
        }
    }

    if (visibility === "individual_students") {
        if (parsedTargetStudents.length === 0) {
            throw new AppError("Target students are required for student-scoped posts", 400);
        }

        const studentCount = await Student.countDocuments({
            _id: { $in: parsedTargetStudents },
        });

        if (studentCount !== parsedTargetStudents.length) {
            throw new AppError("One or more selected students are invalid", 400);
        }
    }

    const totalSize = req.files?.reduce((sum, file) => sum + file.size, 0) || 0;

    if (totalSize > 50 * 1024 * 1024) {
        throw new AppError("Maximum upload size is 50MB", 400);
    }

    const uploadPromises =
        req.files?.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file.path, "feed_attachments");
            return {
                fileName: file.originalname,
                fileUrl: uploadResult.secure_url,
                fileType: getFileType(file.mimetype),
                mimeType: file.mimetype,
                fileSize: file.size,
                publicId: uploadResult.public_id,
            };
        }) || [];

    const attachments = await Promise.all(uploadPromises);

    const feed = await FeedPost.create({
        title,
        description,
        visibility,
        attachments,
        status,
        expiresAt: expiresAt || null,
        createdBy: req.user.id,
        isPinned: isPinned === "true" || isPinned === true,
        targetClasses: visibility === "classes" ? parsedTargetClasses : [],
        targetStudents: visibility === "individual_students" ? parsedTargetStudents : [],
    });

    handleFeedNotificationAsync(feed, req.user.id);

    res.status(201).json({
        success: true,
        message: "Feed created successfully",
        feed
    });
});

// getAllFeedPost
export const getAllFeedPost = asyncHandler(async (req, res) => {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

    const role = req.user.role;
    const now = new Date();

    let query = {};

    if (role === "admin" || role === "management") {
        query = {};
    } else if (role === "teacher") {
        query = {
            $or: [
                { status: "published" },
                { createdBy: req.user.id }
            ]
        };
    } else if (role === "parent") {
        const parent = await Parent.findOne({ userId: req.user.id }).select("studentIds").lean();
        if (!parent) {
            throw new AppError("Parent profile not found", 404);
        }

        const students = await Student.find({ _id: { $in: parent.studentIds } }).select("classId").lean();
        const classIds = students.map(s => s.classId);
        const studentIds = parent.studentIds;

        query = {
            status: "published",
            $and: [
                {
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: now } }
                    ]
                },
                {
                    $or: [
                        { visibility: "all" },
                        { visibility: "classes", targetClasses: { $in: classIds } },
                        { visibility: "individual_students", targetStudents: { $in: studentIds } }
                    ]
                }
            ]
        };
    } else {
        throw new AppError("Invalid role", 403);
    }

    const [feeds, totalCount] = await Promise.all([
        FeedPost.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate("createdBy", "name profilePhoto role")
            .populate("targetClasses", "className section")
            .populate("targetStudents", "studentName profilePhoto classId")
            .lean(),
        FeedPost.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        message: "Feed fetched successfully",
        totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        feed: feeds
    });
});

// getFeedPostById
export const getFeedPostById = asyncHandler(async (req, res) => {
    const { feedId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        throw new AppError("Invalid Feed ID", 400);
    }

    const feed = await FeedPost.findById(feedId)
        .populate("createdBy", "name profilePhoto role")
        .populate("targetClasses", "className section")
        .populate("targetStudents", "studentName profilePhoto classId")
        .lean();

    if (!feed) {
        throw new AppError("Feed not found", 404);
    }

    const role = req.user.role;
    const now = new Date();

    if (role !== "admin" && role !== "management") {
        const creatorId = feed.createdBy._id ? feed.createdBy._id.toString() : feed.createdBy.toString();

        if (feed.status === "draft" && creatorId !== req.user.id) {
            throw new AppError("You are not authorized to view this post", 403);
        }

        if (feed.expiresAt && new Date(feed.expiresAt) <= now && creatorId !== req.user.id) {
            throw new AppError("This post has expired", 403);
        }
    }

    if (role === "admin" || role === "management") {
        return res.status(200).json({
            success: true,
            message: "Feed fetched successfully",
            feed,
        });
    }

    if (feed.visibility === "all") {
        return res.status(200).json({
            success: true,
            message: "Feed fetched successfully",
            feed,
        });
    }

    if (feed.visibility === "teachers") {
        if (role !== "teacher") {
            throw new AppError("You are not authorized to view this post", 403);
        }

        return res.status(200).json({
            success: true,
            message: "Feed fetched successfully",
            feed,
        });
    }

    if (feed.visibility === "classes") {
        if (role === "teacher") {
            return res.status(200).json({
                success: true,
                message: "Feed fetched successfully",
                feed,
            });
        }

        if (role === "parent") {
            const parent = await Parent.findOne({ userId: req.user.id }).select("studentIds").lean();
            if (!parent) {
                throw new AppError("Parent not found", 404);
            }

            const students = await Student.find({ _id: { $in: parent.studentIds } }).select("classId").lean();
            const classIds = students.map(student => student.classId.toString());

            const targetClassIds = feed.targetClasses.map(target => (target._id ? target._id.toString() : target.toString()));
            const hasAccess = classIds.some(classId => targetClassIds.includes(classId));

            if (!hasAccess) {
                throw new AppError("You are not authorized to view this post", 403);
            }

            return res.status(200).json({
                success: true,
                message: "Feed fetched successfully",
                feed,
            });
        }
    }

    if (feed.visibility === "individual_students") {
        if (role === "teacher") {
            return res.status(200).json({
                success: true,
                message: "Feed fetched successfully",
                feed,
            });
        }

        if (role === "parent") {
            const parent = await Parent.findOne({ userId: req.user.id }).select("studentIds").lean();
            if (!parent) {
                throw new AppError("Parent not found", 404);
            }

            const studentIds = parent.studentIds.map(id => id.toString());
            const targetStudentIds = feed.targetStudents.map(target => (target._id ? target._id.toString() : target.toString()));
            const hasAccess = studentIds.some(studentId => targetStudentIds.includes(studentId));

            if (!hasAccess) {
                throw new AppError("You are not authorized to view this post", 403);
            }

            return res.status(200).json({
                success: true,
                message: "Feed fetched successfully",
                feed,
            });
        }
    }

    throw new AppError("You are not authorized to view this post", 403);
});

// updateFeedPost
export const updateFeedPost = asyncHandler(async (req, res) => {
    const { feedId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        throw new AppError("Invalid Feed ID", 400);
    }

    const feed = await FeedPost.findById(feedId);
    if (!feed) {
        throw new AppError("Feed not found", 404);
    }

    let { title, description, visibility, targetClasses, targetStudents, status, expiresAt, isPinned, removedAttachments = [] } = req.body;

    if (typeof targetClasses === "string") {
        targetClasses = JSON.parse(targetClasses);
    }

    if (typeof targetStudents === "string") {
        targetStudents = JSON.parse(targetStudents);
    }

    if (typeof removedAttachments === "string") {
        removedAttachments = JSON.parse(removedAttachments);
    }

    if (visibility === "classes") {
        if (!Array.isArray(targetClasses) || targetClasses.length === 0) {
            throw new AppError("Target classes are required", 400);
        }

        const classCount = await Class.countDocuments({
            _id: { $in: targetClasses }
        });

        if (classCount !== targetClasses.length) {
            throw new AppError("One or more selected classes are invalid", 400);
        }

        feed.targetClasses = targetClasses;
        feed.targetStudents = [];
    } else if (visibility === "individual_students") {
        if (!Array.isArray(targetStudents) || targetStudents.length === 0) {
            throw new AppError("Target students are required", 400);
        }

        const studentCount = await Student.countDocuments({
            _id: { $in: targetStudents }
        });

        if (studentCount !== targetStudents.length) {
            throw new AppError("One or more selected students are invalid", 400);
        }

        feed.targetStudents = targetStudents;
        feed.targetClasses = [];
    } else if (visibility !== undefined) {
        feed.targetClasses = [];
        feed.targetStudents = [];
    }

    if (removedAttachments.length > 0) {
        const attachmentsToDelete = feed.attachments.filter(
            item => removedAttachments.includes(item.fileUrl)
        );
        for (const attachment of attachmentsToDelete) {
            if (attachment.publicId) {
                const resourceType = attachment.fileType === "image" ? "image" : (attachment.fileType === "video" ? "video" : "raw");
                await deleteFromCloudinary(attachment.publicId, resourceType);
            }
        }
        feed.attachments = feed.attachments.filter(
            item => !removedAttachments.includes(item.fileUrl)
        );
    }

    const newAttachmentsPromises =
        req.files?.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file.path, "feed_attachments");
            return {
                fileName: file.originalname,
                fileUrl: uploadResult.secure_url,
                fileType: getFileType(file.mimetype),
                mimeType: file.mimetype,
                fileSize: file.size,
                publicId: uploadResult.public_id,
            };
        }) || [];

    const newAttachments = await Promise.all(newAttachmentsPromises);

    feed.attachments.push(...newAttachments);

    if (title !== undefined) feed.title = title;
    if (description !== undefined) feed.description = description;
    if (visibility !== undefined) feed.visibility = visibility;
    if (status !== undefined) feed.status = status;
    if (expiresAt !== undefined) feed.expiresAt = expiresAt || null;
    if (isPinned !== undefined) feed.isPinned = isPinned === "true" || isPinned === true;

    await feed.save();

    return res.status(200).json({
        success: true,
        message: "Feed updated successfully",
        feed,
    });
});

// deleteFeedPost
export const deleteFeedPost = asyncHandler(async (req, res) => {
    const { feedId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        throw new AppError("Invalid Feed ID", 400);
    }

    const feed = await FeedPost.findById(feedId);
    if (!feed) {
        throw new AppError("Feed not found", 404);
    }

    if (feed.attachments && feed.attachments.length > 0) {
        for (const attachment of feed.attachments) {
            if (attachment.publicId) {
                const resourceType = attachment.fileType === "image" ? "image" : (attachment.fileType === "video" ? "video" : "raw");
                await deleteFromCloudinary(attachment.publicId, resourceType);
            }
        }
    }

    await feed.deleteOne();

    res.status(200).json({
        success: true,
        message: "Feed deleted successfully",
    });
});

// pinFeedPost
export const pinFeedPost = asyncHandler(async (req, res) => {
    const { feedId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        throw new AppError("Invalid Feed ID", 400);
    }

    const feed = await FeedPost.findById(feedId);
    if (!feed) {
        throw new AppError("Feed not found", 404);
    }

    if (feed.isPinned) {
        throw new AppError("Feed is already pinned", 400);
    }

    feed.isPinned = true;
    await feed.save();

    res.status(200).json({
        success: true,
        message: "Feed pinned successfully",
        feed,
    });
});

// unpinFeedPost
export const unpinFeedPost = asyncHandler(async (req, res) => {
    const { feedId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        throw new AppError("Invalid Feed ID", 400);
    }

    const feed = await FeedPost.findById(feedId);
    if (!feed) {
        throw new AppError("Feed not found", 404);
    }

    if (!feed.isPinned) {
        throw new AppError("Feed is already unpinned", 400);
    }

    feed.isPinned = false;
    await feed.save();

    res.status(200).json({
        success: true,
        message: "Feed unpinned successfully",
        feed,
    });
});