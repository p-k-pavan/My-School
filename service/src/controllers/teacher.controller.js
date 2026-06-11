import XLSX from "xlsx";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { Teacher } from "../models/teacher.model.js";

export const createTeacher = asyncHandler(async (req, res) => {
    const {
        employeeId,
        teacherName,
        mobile,
        email,
        qualification,
        joiningDate,
        assignedClasses,
    } = req.body;

    if (
        !employeeId ||
        !teacherName ||
        !mobile ||
        !email ||
        !qualification ||
        !joiningDate
    ) {
        throw new AppError(
            "All fields are required",
            400
        );
    }

    const existingTeacher = await Teacher.findOne({
        $or: [
            { employeeId },
            { email },
            { mobile },
        ],
    });

    if (existingTeacher) {
        throw new AppError(
            "Teacher already exists",
            409
        );
    }

    const newTeacher = await Teacher.create({
        employeeId,
        teacherName,
        email,
        mobile,
        qualification,
        joiningDate,
        assignedClasses,
    });

    res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        teacher: newTeacher,
    });
});

export const bulkUploadTeacher = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError(
            "Excel file is required",
            400
        );
    }

    const workbook = XLSX.readFile(req.file.path);

    const sheetName = workbook.SheetNames[0];

    const worksheet =
        workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(
        worksheet
    );

    const teachers = data
        .filter(
            (row) =>
                row.employeeId &&
                row.teacherName &&
                row.email &&
                row.mobile
        )
        .map((row) => ({
            employeeId: row.employeeId,
            teacherName: row.teacherName,
            email: row.email,
            mobile: row.mobile,
            qualification: row.qualification,
            joiningDate: row.joiningDate,
            assignedClasses:
                row.assignedClasses || [],
        }));

    await Teacher.insertMany(teachers, {
        ordered: false,
    });

    res.status(201).json({
        success: true,
        message:
            "Teachers uploaded successfully",
        count: teachers.length,
    });
}
);

export const getAllTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find()
        .populate(
            "assignedClasses",
            "className section"
        )
        .sort({ teacherName: 1 });

    res.status(200).json({
        success: true,
        message: "Teachers fetched successfully",
        count: teachers.length,
        teachers,
    });
}
);

export const getTeacherById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const teacher = await Teacher.findById(id)
        .populate(
            "assignedClasses",
            "className section"
        );

    if (!teacher) {
        throw new AppError(
            "Teacher not found",
            404
        );
    }

    res.status(200).json({
        success: true,
        message: "Teacher fetched successfully",
        teacher
    });
}
);

export const updateTeacher = asyncHandler(
    async (req, res) => {
        const { id } = req.params;

        const {
            teacherName,
            mobile,
            email,
            qualification,
            assignedClasses,
            joiningDate,
        } = req.body;

        const teacher = await Teacher.findById(id);

        if (!teacher) {
            throw new AppError(
                "Teacher not found",
                404
            );
        }

        const existingTeacher =
            await Teacher.findOne({
                $or: [
                    { email },
                    { mobile },
                ],
                _id: { $ne: id },
            });

        if (existingTeacher) {
            throw new AppError(
                "Teacher already exists",
                409
            );
        }

        teacher.teacherName = teacherName || teacher.teacherName;

        teacher.email = email || teacher.email;

        teacher.mobile = mobile || teacher.mobile;

        teacher.qualification = qualification || teacher.qualification;

        teacher.assignedClasses = assignedClasses || teacher.assignedClasses;

        teacher.joiningDate = joiningDate || teacher.joiningDate;

        await teacher.save();

        res.status(200).json({
            success: true,
            message:
                "Teacher updated successfully",
            teacher,
        });
    }
);

export const deleteTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assignedClass = await Class.findOne({
        classTeacher: id,
    });

    if (assignedClass) {
        throw new AppError(
            "Teacher is assigned to a class. Remove the assignment first.",
            400
        );
    }

    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
        throw new AppError(
            "Teacher not found",
            404
        );
    }

    res.status(200).json({
        success: true,
        message: "Teacher successfully deleted.",
    });
});
