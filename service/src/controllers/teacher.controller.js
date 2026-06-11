import XLSX from "xlsx";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { Teacher } from "../models/teacher.model.js";
import { User } from "../models/user.model.js";
import { generatePassword } from "../utils/genaratePassword.js";

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

    const existingUser = await User.findOne({
        $or: [
            { email },
            { mobile },
        ],
    });

    if (existingUser) {
        throw new AppError(
            "User already exists with this email or mobile",
            409
        );
    }

    let newUser = null;

    try {
        const password =
            await generatePassword(
                teacherName,
                mobile
            );

        newUser = await User.create({
            name: teacherName,
            email,
            mobile,
            role: "teacher",
            password,
            isPasswordChanged: false,
        });

        const newTeacher =
            await Teacher.create({
                userId: newUser._id,
                employeeId,
                teacherName,
                email,
                mobile,
                qualification,
                joiningDate,
                assignedClasses:
                    assignedClasses || [],
            });

        res.status(201).json({
            success: true,
            message:
                "Teacher created successfully",
            teacher: newTeacher,
        });
    } catch (error) {
        if (newUser) {
            await User.findByIdAndDelete(
                newUser._id
            );
        }

        throw error;
    }
});

export const bulkUploadTeacher = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError(
            "Excel file is required",
            400
        );
    }

    const createdTeachers = [];
    const errors = [];

    try {
        const workbook = XLSX.readFile(req.file.path);

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const data =
            XLSX.utils.sheet_to_json(
                worksheet
            );

        for (const row of data) {
            let user = null;

            try {
                const {
                    employeeId,
                    teacherName,
                    email,
                    mobile,
                    qualification,
                    joiningDate,
                    assignedClasses,
                } = row;

                if (
                    !employeeId ||
                    !teacherName ||
                    !email ||
                    !mobile
                ) {
                    errors.push({
                        employeeId:
                            employeeId || "N/A",
                        error:
                            "Required fields missing",
                    });

                    continue;
                }

                const existingTeacher =
                    await Teacher.findOne({
                        $or: [
                            { employeeId },
                            { email },
                            { mobile },
                        ],
                    });

                if (existingTeacher) {
                    errors.push({
                        employeeId,
                        error:
                            "Teacher already exists",
                    });

                    continue;
                }

                const existingUser =
                    await User.findOne({
                        $or: [
                            { email },
                            { mobile },
                        ],
                    });

                if (existingUser) {
                    errors.push({
                        employeeId,
                        error:
                            "User already exists with this email or mobile",
                    });

                    continue;
                }

                const hashedPassword =
                    await generatePassword(
                        teacherName,
                        mobile
                    );

                user = await User.create({
                    name: teacherName,
                    email,
                    mobile,
                    role: "teacher",
                    password: hashedPassword,
                    isPasswordChanged: false,
                });

                const teacher =
                    await Teacher.create({
                        userId: user._id,
                        employeeId,
                        teacherName,
                        email,
                        mobile,
                        qualification,
                        joiningDate,
                        assignedClasses:
                            assignedClasses || [],
                    });

                createdTeachers.push(
                    teacher
                );
            } catch (error) {
                if (user) {
                    await User.findByIdAndDelete(
                        user._id
                    );
                }

                errors.push({
                    employeeId:
                        row.employeeId || "N/A",
                    error: error.message,
                });
            }
        }

        res.status(201).json({
            success: true,
            message:
                "Bulk upload completed",
            createdCount:
                createdTeachers.length,
            failedCount: errors.length,
            createdTeachers,
            errors,
        });
    } finally {
        if (
            req.file?.path &&
            fs.existsSync(req.file.path)
        ) {
            fs.unlinkSync(req.file.path);
        }
    }
});

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
