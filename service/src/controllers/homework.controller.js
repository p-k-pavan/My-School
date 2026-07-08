import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Homework } from "../models/homework.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Class } from "../models/class.model.js";
import Subject from "../models/subject.model.js";
import { Parent } from "../models/parent.model.js";
import { Notification } from "../models/notification.model.js";
import AppError from "../utils/AppError.js";
import { sendPushNotificationsAsync } from "../utils/fcm.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";


const getFileType = (mimeType) => {
    if (mimeType.includes("pdf")) return "pdf";

    if (mimeType.startsWith("image/")) return "image";

    if (
        mimeType.includes("word") ||
        mimeType.includes("document")
    ) {
        return "doc";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    return "other";
};

export const handleHomeworkNotificationAsync = (homework, action, actorId) => {
    setImmediate(async () => {
        try {
            const [klass, subject] = await Promise.all([
                Class.findById(homework.classId).lean(),
                Subject.findById(homework.subjectId).lean(),
            ]);

            if (!klass || !subject) {
                console.warn(`Unable to send homework notification. Class or Subject not found for Homework: ${homework._id}`);
                return;
            }

            const className = `${klass.className}-${klass.section}`;

            const dueDate = new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }).format(new Date(homework.dueDate));

            const notificationContent = {
                create: {
                    title: `New Homework: ${subject.subjectName} (${className})`,
                    description: `New homework assigned: "${homework.title}". Due Date: ${dueDate}`,
                },

                update: {
                    title: `Homework Updated: ${subject.subjectName} (${className})`,
                    description: `Homework "${homework.title}" has been updated. Due Date: ${dueDate}`,
                },

                delete: {
                    title: `Homework Cancelled: ${subject.subjectName} (${className})`,
                    description: `Homework "${homework.title}" has been cancelled.`,
                },
            };

            const content = notificationContent[action];

            if (!content) {
                console.warn(`Unknown notification action: ${action}`);
                return;
            }

            const parentIds = await Student.distinct("parentId", {
                classId: homework.classId,
                status: true,
            });

            let userIds = await Parent.distinct("userId", {
                _id: { $in: parentIds },
                status: true,
            });

            const TeacherUserId = await Teacher.findOne({ _id: homework.teacherId }).lean();

            userIds = [...new Set([
                ...userIds,
                TeacherUserId?.userId
            ])]

            if (!userIds.length) {
                console.log( `No active parent users found for Class ${className}.` );
                return;
            }

            const notification = await Notification.create({
                title: content.title,
                description: content.description,
                type: "homework",
                receiverType: "classes",
                targetClasses: [homework.classId],
                entityId: homework._id,
                createdBy: actorId,
            });

            sendPushNotificationsAsync({
                title: content.title,
                body: content.description,
                userIds,
                data: {
                    type: "homework",
                    notificationId: notification._id.toString(),
                    homeworkId: homework._id.toString(),
                    action,
                },

                onSuccess: async () => {
                    await Notification.findByIdAndUpdate(
                        notification._id,
                        { isPushSent: true }
                    );
                },
            });

        } catch (error) {
            console.error(`Homework notification failed (${action})`, error);
        }
    });
};

export const createHomework = asyncHandler(async (req, res) => {
    const { title, description, classId, subjectId, assignedDate, dueDate } = req.body;



    if (!title || !description || !classId || !subjectId || !assignedDate || !dueDate) {
        throw new AppError(
            "Required fields are missing",
            400
        );
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        throw new AppError("Invalid subject ID", 400);
    }

    const [klass, subject] = await Promise.all([
        Class.findById(classId),
        Subject.findById(subjectId)
    ]);

    if (!klass) {
        throw new AppError("Class not found", 404);
    }

    if (!subject) {
        throw new AppError("Subject not found", 404);
    }

    const assigned = new Date(assignedDate);
    const due = new Date(dueDate);

    const uploadPromises = req.files?.map(async (file) => {
        const uploadResult = await uploadToCloudinary(file.path, "homework_attachments");
        return {
            fileName: file.originalname,
            fileUrl: uploadResult.secure_url,
            fileType: getFileType(file.mimetype),
            publicId: uploadResult.public_id,
        };
    }) || [];

    const attachments = await Promise.all(uploadPromises);

    if (assigned >= due) {
        throw new AppError(
            "Assigned date must be before due date",
            400
        );
    }

    let dbTeacherId;
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (!teacher) {
            throw new AppError("Teacher profile not found", 404);
        }
        dbTeacherId = teacher._id;
    } else {
        const klass = await Class.findById(classId);
        if (klass && klass.classTeacher) {
            dbTeacherId = klass.classTeacher;
        } else {
            const anyTeacher = await Teacher.findOne();
            if (!anyTeacher) {
                throw new AppError("No teachers found in the system to assign homework", 400);
            }
            dbTeacherId = anyTeacher._id;
        }
    }

    const homework = await Homework.create({
        title,
        description,
        classId,
        subjectId,
        teacherId: dbTeacherId,
        assignedDate: assigned,
        attachments,
        dueDate: due
    });

    handleHomeworkNotificationAsync(homework, "create", req.user.id);

    return res.status(200).json({
        success: true,
        message: "Homework Created successfully",
        homework,
    });
})

//updateHomework
export const updateHomework = asyncHandler(async (req, res) => {
    const {
        id,
        title,
        description,
        dueDate,
    } = req.body;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Homework ID", 400);
    }

    const homework = await Homework.findById(id);


    if (!homework) {
        throw new AppError("Homework not found", 404);
    }

    const isManagementOrAdmin = ["admin", "management"].includes(req.user.role);
    let isOwner = false;
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (teacher && homework.teacherId.equals(teacher._id)) {
            isOwner = true;
        }
    }

    if (!isOwner && !isManagementOrAdmin) {
        throw new AppError(
            "You are not authorized to update this homework",
            403
        );
    }

    const assigned = new Date(homework.assignedDate);
    const due = new Date(dueDate);

    if (assigned >= due) {
        throw new AppError(
            "Assigned date must be before due date",
            400
        );
    }

    const existingAttachments = req.body.existingAttachments
        ? JSON.parse(req.body.existingAttachments)
        : [];

    const existingUrls = existingAttachments.map(item => item.fileUrl);
    const removedAttachments = homework.attachments.filter(
        item => !existingUrls.includes(item.fileUrl)
    );
    for (const attachment of removedAttachments) {
        if (attachment.publicId) {
            const resourceType = attachment.fileType === "image" ? "image" : (attachment.fileType === "video" ? "video" : "raw");
            await deleteFromCloudinary(attachment.publicId, resourceType);
        }
    }

    const uploadPromises = (req.files || []).map(async (file) => {
        const uploadResult = await uploadToCloudinary(file.path, "homework_attachments");
        return {
            fileName: file.originalname,
            fileUrl: uploadResult.secure_url,
            fileType: getFileType(file.mimetype),
            publicId: uploadResult.public_id,
        };
    });
    const newAttachments = await Promise.all(uploadPromises);

    homework.attachments = [
        ...existingAttachments,
        ...newAttachments,
    ];

    homework.title = title;
    homework.description = description;
    homework.dueDate = due;

    await homework.save();

    handleHomeworkNotificationAsync(homework, "update", req.user.id);

    return res.status(200).json({
        success: true,
        message: "Homework updated successfully",
        homework,
    });
});

//deleteHomework
export const deleteHomework = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Homework ID", 400);
    }

    const homework = await Homework.findById(id);

    if (!homework) {
        throw new AppError("Homework not found", 404);
    }

    const isManagement = req.user.role === "management" || req.user.role === "admin";
    let isOwner = false;
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (teacher && homework.teacherId.equals(teacher._id)) {
            isOwner = true;
        }
    }

    if (!isOwner && !isManagement) {
        throw new AppError(
            "You are not authorized to delete this homework",
            403
        );
    }

    if (homework.attachments && homework.attachments.length > 0) {
        for (const attachment of homework.attachments) {
            if (attachment.publicId) {
                const resourceType = attachment.fileType === "image" ? "image" : (attachment.fileType === "video" ? "video" : "raw");
                await deleteFromCloudinary(attachment.publicId, resourceType);
            }
        }
    }

    await Homework.findByIdAndDelete(id);

    handleHomeworkNotificationAsync(homework, "delete", req.user.id);

    return res.status(200).json({
        success: true,
        message: "Homework deleted successfully",
    });
});

//getHomeworkById
export const getHomeworkById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Homework ID", 400);
    }

    const homework = await Homework.findById(id)
        .populate("teacherId", "teacherName")
        .populate("classId", "className section")
        .populate("subjectId", "subjectName subjectCode");

    if (!homework) {
        throw new AppError("Homework not found", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Homework fetched successfully",
        homework,
    });
});

//getHomeworkByClass
export const getHomeworkByClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assignedDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(
            "Invalid Class ID",
            400
        );
    }

    const filter = {
        classId: id,
    };

    if (assignedDate) {
        const startDate = new Date(assignedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(assignedDate);
        endDate.setHours(23, 59, 59, 999);

        filter.assignedDate = {
            $gte: startDate,
            $lte: endDate,
        };
    }

    const homework = await Homework.find(filter)
        .populate("teacherId", "teacherName")
        .populate("subjectId", "subjectName subjectCode")
        .sort({ assignedDate: -1 });

    return res.status(200).json({
        success: true,
        count: homework.length,
        homework,
    });
});

//getStudentHomework
export const getStudentHomework = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { assignedDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new AppError("Invalid Student ID", 400);
    }

    const student = await Student.findById(studentId);

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    if (req.user.role === "parent") {
        const parent = await Parent.findOne({ userId: req.user.id });
        if (!parent || student.parentId.toString() !== parent._id.toString()) {
            throw new AppError(
                "You are not authorized to access this student",
                403
            );
        }
    }

    const filter = {
        classId: student.classId,
    };

    if (assignedDate) {
        const startDate = new Date(assignedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(assignedDate);
        endDate.setHours(23, 59, 59, 999);

        filter.assignedDate = {
            $gte: startDate,
            $lte: endDate,
        };
    }

    const homework = await Homework.find(filter)
        .populate("teacherId", "teacherName")
        .populate("subjectId", "subjectName subjectCode")
        .sort({ assignedDate: -1 });

    return res.status(200).json({
        success: true,
        count: homework.length,
        homework,
    });
});

//getHomeWorkByteacher
export const getHomeworkByTeacher = asyncHandler(async (req, res) => {
    const { assignedDate } = req.query;
    const teacher = await Teacher.findOne({
        userId: req.user.id,
    });

    if (!teacher) {
        throw new AppError("Teacher not found", 404);
    }

    const filter = {
        teacherId: teacher._id
    };

    if (assignedDate) {
        const startDate = new Date(assignedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(assignedDate);
        endDate.setHours(23, 59, 59, 999);

        filter.assignedDate = {
            $gte: startDate,
            $lte: endDate,
        };
    }

    const homework = await Homework.find(filter)
        .populate("classId", "className section")
        .populate("subjectId", "subjectName subjectCode")
        .sort({ assignedDate: -1 });

    return res.status(200).json({
        success: true,
        count: homework.length,
        homework,
    });
});