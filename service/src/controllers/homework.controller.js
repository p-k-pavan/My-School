import asyncHandler from "../middleware/asyncHandler.js";
import { Homework } from "../models/homework.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
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
        fileUrl: file.path,
        fileType: getFileType(file.mimetype),
    })) || [];

    if (assigned >= due) {
        throw new AppError(
            "Assigned date must be before due date",
            400
        );
    }

    const homework = await Homework.create({
        title,
        description,
        classId,
        subjectId,
        teacherId: req.user.id,
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

    if (!homework.teacherId.equals(req.user.id)) {
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

    const attachments = req.files?.length
        ? req.files.map((file) => ({
            fileName: file.originalname,
            fileUrl: file.path,
            fileType: getFileType(file.mimetype),
        }))
        : homework.attachments;

    homework.title = title;
    homework.description = description;
    homework.dueDate = due;
    homework.attachments = attachments;

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

    const isOwner = homework.teacherId.equals(req.user.id);
    const isManagement = req.user.role === "management";

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Class ID", 400);
    }

    const homework = await Homework.find({
        classId: id,
    })
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

    const homework = await Homework.find({
        classId: student.classId,
    })
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
    const teacher = await Teacher.findOne({
        userId: req.user.id,
    });

    if (!teacher) {
        throw new AppError("Teacher not found", 404);
    }

    const homework = await Homework.find({
        teacherId: teacher._id,
    })
        .populate("classId", "className section")
        .populate("subjectId", "subjectName subjectCode")
        .sort({ assignedDate: -1 });

    return res.status(200).json({
        success: true,
        count: homework.length,
        homework,
    });
});