import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Homework } from "../models/homework.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Class } from "../models/class.model.js";
import Subject from "../models/subject.model.js";
import AppError from "../utils/AppError.js";

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

//createHomework
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

    const attachments = req.files?.map((file) => ({
        fileName: file.originalname,
        fileUrl: file.path.replace(/\\/g, "/"),
        fileType: getFileType(file.mimetype),
    })) || [];

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
    })

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

    const newAttachments = (req.files || []).map((file) => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: getFileType(file.mimetype),
    }));

    homework.attachments = [
        ...existingAttachments,
        ...newAttachments,
    ];

    homework.title = title;
    homework.description = description;
    homework.dueDate = due;

    await homework.save();

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

    await Homework.findByIdAndDelete(id);

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

    if (
        req.user.role === "parent" &&
        student.parentId.toString() !== req.user.id.toString()
    ) {
        throw new AppError(
            "You are not authorized to access this student",
            403
        );
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