import mongoose from "mongoose";
import XLSX from "xlsx";
import fs from "fs";
import { Student } from "../models/student.model.js";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Parent } from "../models/parent.model.js";
import { createAuditLog } from "./auditLog.controller.js";


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
        const matchingParents = await Parent.find({
            $or: [
                { fatherName: { $regex: search, $options: "i" } },
                { motherName: { $regex: search, $options: "i" } },
                { guardianName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
            ]
        }).select("_id");

        const parentIds = matchingParents.map(p => p._id);

        query.$or = [
            { studentName: { $regex: search, $options: "i" } },
            { admissionNo: { $regex: search, $options: "i" } },
            { parentId: { $in: parentIds } },
        ];
    }

    if (classId) query.classId = classId;
    if (section) query.section = section;

    if (status !== undefined) {
        query.status = status === "true";
    }

    const totalStudents = await Student.countDocuments(query);

    const students = await Student.find(query)
        .populate("classId", "className section")
        .populate("parentId", "email phoneNumber fatherName motherName")
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
        .populate("classId", "className section")
        .populate("parentId", "email phoneNumber fatherName motherName")

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    if (req.user.role === "parent") {
        const parent = await Parent.findOne({ userId: req.user.id });
        if (!parent || student.parentId._id.toString() !== parent._id.toString()) {
            throw new AppError("Access denied. You can only view your own children", 403);
        }
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

    createAuditLog({
        userId: req.user.id,
        role: req.user.role,
        module: "student",
        action: "update",
        entityId: student._id,
        entityType: "Student",
        title: "Student Status Changed",
        description: `Student ${student.studentName} status set to ${student.status}`,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
        success: true,
        message: `Student ${student.status ? "activated" : "deactivated"
            } successfully`,
        student,
    });
});

export const getStudentsByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    const students = await Student.find({
        classId,
        status: { $ne: false },
    })
        .populate("classId", "className section")
        .populate(
            "parentId",
            "email phoneNumber fatherName motherName"
        )
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

    if (req.user.role === "parent") {
        const parent = await Parent.findOne({ userId: req.user.id });
        if (!parent || parent._id.toString() !== parentId) {
            throw new AppError("Access denied. You can only view your own children", 403);
        }
    }

    const students = await Student.find({ parentId })
        .populate("classId", "className section")
        .populate(
            "parentId",
            "email phoneNumber fatherName motherName"
        )
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
        throw new AppError(
            "Invalid student ID",
            400
        );
    }

    const student = await Student.findById(id);

    if (!student) {
        throw new AppError(
            "Student not found",
            404
        );
    }

    const {
        admissionNo,
        studentName,
        profilePhoto,
        classId,
        rollNo,
        dob,
        gender,
        bloodGroup,
        aadhaarNumber,
        academicYear,
        parentId,
        joiningDate
    } = req.body;

    if (
        admissionNo &&
        admissionNo !== student.admissionNo
    ) {
        const existingStudent =
            await Student.findOne({
                admissionNo,
                _id: { $ne: id },
            });

        if (existingStudent) {
            throw new AppError(
                "Admission number already exists",
                409
            );
        }
    }

    if (
        aadhaarNumber &&
        aadhaarNumber !==
        student.aadhaarNumber
    ) {
        const existingStudent =
            await Student.findOne({
                aadhaarNumber,
                _id: { $ne: id },
            });

        if (existingStudent) {
            throw new AppError(
                "Aadhaar number already exists",
                409
            );
        }
    }

    if (
        rollNo !== undefined ||
        classId !== undefined
    ) {
        const existingRoll =
            await Student.findOne({
                classId:
                    classId ||
                    student.classId,
                rollNo:
                    rollNo ||
                    student.rollNo,
                _id: { $ne: id },
            });

        if (existingRoll) {
            throw new AppError(
                "Roll number already exists in this class",
                409
            );
        }
    }

    if (admissionNo !== undefined)
        student.admissionNo =
            admissionNo;

    if (studentName !== undefined)
        student.studentName =
            studentName;

    if (profilePhoto !== undefined)
        student.profilePhoto =
            profilePhoto;

    if (classId !== undefined)
        student.classId = classId;

    if (rollNo !== undefined)
        student.rollNo = rollNo;

    if (dob !== undefined)
        student.dob = dob;

    if (gender !== undefined)
        student.gender = gender;

    if (bloodGroup !== undefined)
        student.bloodGroup =
            bloodGroup;

    if (aadhaarNumber !== undefined)
        student.aadhaarNumber =
            aadhaarNumber;

    if (academicYear !== undefined)
        student.academicYear =
            academicYear;

    if (parentId !== undefined)
        student.parentId =
            parentId;

    if (joiningDate !== undefined)
        student.joiningDate =
            joiningDate;


    await student.save();

    const updatedStudent =
        await Student.findById(id)
            .populate(
                "classId",
                "className section"
            )
            .populate(
                "parentId",
                "fatherName motherName phoneNumber"
            );

    createAuditLog({
        userId: req.user.id,
        role: req.user.role,
        module: "student",
        action: "update",
        entityId: student._id,
        entityType: "Student",
        title: "Student Updated",
        description: `Student ${student.studentName} details updated`,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
        success: true,
        message:
            "Student updated successfully",
        student: updatedStudent,
    });
});
