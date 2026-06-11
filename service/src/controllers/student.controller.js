import mongoose from "mongoose";
import { Student } from "../models/student.model.js";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const createStudent = asyncHandler(async (req, res) => {
    const {
        admissionNo,
        studentName,
        profilePhoto,
        classId,
        section,
        rollNo,
        dob,
        gender,
        bloodGroup,
        address,
        fatherName,
        motherName,
        parentId,
        joiningDate,
    } = req.body;


    if (
        !admissionNo ||
        !studentName ||
        !classId ||
        !section ||
        !rollNo ||
        !dob ||
        !gender ||
        !fatherName ||
        !motherName ||
        !parentId
    ) {
        throw new AppError("Please provide all required fields", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid Class ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new AppError("Invalid Parent ID", 400);
    }

    const existingAdmission = await Student.findOne({ admissionNo });

    if (existingAdmission) {
        throw new AppError("Admission number already exists", 400);
    }

    const classExists = await Class.findById(classId);

    if (!classExists) {
        throw new AppError("Class not found", 404);
    }

    const parentExists = await User.findById(parentId);

    if (!parentExists) {
        throw new AppError("Parent not found", 404);
    }

    const existingRollNo = await Student.findOne({
        classId,
        section,
        rollNo,
    });

    if (existingRollNo) {
        throw new AppError(
            `Roll No ${rollNo} already exists in Section ${section}`,
            400
        );
    }

    const birthDate = new Date(dob);

    if (birthDate > new Date()) {
        throw new AppError(
            "Date of birth cannot be a future date",
            400
        );
    }

    const student = await Student.create({
        admissionNo,
        studentName,
        profilePhoto,
        classId,
        section,
        rollNo,
        dob,
        gender,
        bloodGroup,
        address,
        fatherName,
        motherName,
        parentId,
        joiningDate,
    });

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: student,
    });
});

export const getAllStudents = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        classId,
        section,
        status,
    } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { studentName: { $regex: search, $options: "i" } },
            { admissionNo: { $regex: search, $options: "i" } },
        ];
    }

    if (classId) query.classId = classId;
    if (section) query.section = section;

    if (status !== undefined) {
        query.status = status === "true";
    }

    const totalStudents = await Student.countDocuments(query);

    const students = await Student.find(query)
        .populate("classId", "className")
        .populate("parentId", "name email phone")
        .sort({ rollNo: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        totalStudents,
        currentPage: Number(page),
        totalPages: Math.ceil(totalStudents / limit),
        students,
    });
});

export const getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid student ID", 400);
    }

    const student = await Student.findById(id)
        .populate("classId", "className")
        .populate("parentId", "name email phone");

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Student fetched successfully",
        student,
    });
});

export const changeStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    student.status = !student.status;

    await student.save();

    res.status(200).json({
        success: true,
        message: `Student ${student.status ? "activated" : "deactivated"
            } successfully`,
        student,
    });
});

export const getStudentsByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { section } = req.query;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    const query = { classId };

    if (section) {
        query.section = section;
    }

    const students = await Student.find(query)
        .populate("classId", "className")
        .populate("parentId", "name email phone")
        .sort({ rollNo: 1 });

    res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        count: students.length,
        students,
    });
});

export const getStudentsByParent = asyncHandler(async (req, res) => {
    const { parentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new AppError("Invalid parent ID", 400);
    }

    const students = await Student.find({ parentId })
        .populate("classId", "className")
        .populate("parentId", "name email phone")
        .sort({ studentName: 1 });

    res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        count: students.length,
        students,
    });
});

export const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid student ID", 400);
    }

    const student = await Student.findById(id);

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    const {
        admissionNo,
        studentName,
        profilePhoto,
        classId,
        section,
        rollNo,
        dob,
        gender,
        bloodGroup,
        address,
        fatherName,
        motherName,
        parentId,
        joiningDate,
    } = req.body;

    if (admissionNo && admissionNo !== student.admissionNo) {
        const existingStudent = await Student.findOne({
            admissionNo,
            _id: { $ne: id },
        });

        if (existingStudent) {
            throw new AppError("Admission number already exists", 400);
        }
    }

    if (rollNo || classId || section) {
        const existingRoll = await Student.findOne({
            classId: classId || student.classId,
            section: section || student.section,
            rollNo: rollNo || student.rollNo,
            _id: { $ne: id },
        });

        if (existingRoll) {
            throw new AppError(
                "Roll number already exists in this class and section",
                400
            );
        }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
        id,
        {
            admissionNo,
            studentName,
            profilePhoto,
            classId,
            section,
            rollNo,
            dob,
            gender,
            bloodGroup,
            address,
            fatherName,
            motherName,
            parentId,
            joiningDate,
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("classId", "className")
        .populate("parentId", "name email phone");

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        student: updatedStudent,
    });
});

export const bulkUploadStudents = asyncHandler(async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        throw new AppError("Students data is required", 400);
    }

    const errors = [];
    const validStudents = [];

    for (let i = 0; i < students.length; i++) {
        const student = students[i];

        const {
            admissionNo,
            studentName,
            classId,
            section,
            rollNo,
            dob,
            gender,
            fatherName,
            motherName,
            parentId,
        } = student;

        if (
            !admissionNo ||
            !studentName ||
            !classId ||
            !section ||
            !rollNo ||
            !dob ||
            !gender ||
            !fatherName ||
            !motherName ||
            !parentId
        ) {
            errors.push({
                row: i + 1,
                admissionNo,
                error: "Missing required fields",
            });
            continue;
        }

        if (
            !mongoose.Types.ObjectId.isValid(classId) ||
            !mongoose.Types.ObjectId.isValid(parentId)
        ) {
            errors.push({
                row: i + 1,
                admissionNo,
                error: "Invalid Class ID or Parent ID",
            });
            continue;
        }

        validStudents.push(student);
    }

    const admissionNumbers = validStudents.map(
        (student) => student.admissionNo
    );

    const existingStudents = await Student.find({
        admissionNo: { $in: admissionNumbers },
    }).select("admissionNo");

    const existingAdmissionNos = existingStudents.map(
        (student) => student.admissionNo
    );

    const studentsToInsert = validStudents.filter(
        (student) =>
            !existingAdmissionNos.includes(student.admissionNo)
    );

    const insertedStudents = await Student.insertMany(
        studentsToInsert,
        {
            ordered: false,
        }
    );

    res.status(201).json({
        success: true,
        message: "Bulk upload completed",
        insertedCount: insertedStudents.length,
        failedCount: errors.length,
        skippedCount:
            validStudents.length - insertedStudents.length,
        errors,
    });
});