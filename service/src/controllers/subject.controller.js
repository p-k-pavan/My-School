import mongoose from "mongoose";
import Subject from "../models/subject.model.js";
import { Class } from "../models/class.model.js";
import { Teacher } from "../models/teacher.model.js";
import Timetable from "../models/timetable.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";


export const createSubject = asyncHandler(async (req, res) => {
    const { subjectName, subjectCode, isActive } = req.body;

    if (!subjectName || !subjectCode ) {
        throw new AppError("Subject name and subject code are required", 400);
    }


    const duplicateSubject = await Subject.findOne({
        subjectCode: subjectCode.toUpperCase().trim(),
    });

    if (duplicateSubject) {
        throw new AppError(`Subject with code '${subjectCode}' already exists for this class`, 409);
    }

    const newSubject = await Subject.create({
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.toUpperCase().trim(),
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.id,
    });

    res.status(201).json({
        success: true,
        message: "Subject created successfully",
        subject: newSubject,
    });
});

export const getSubjects = asyncHandler(async (req, res) => {
    const { search = "", page = 1, limit = 10, isActive } = req.query;

    const query = {};

    if (isActive !== undefined) {
        query.isActive = isActive === "true";
    }

    if (search) {
        query.$or = [
            { subjectName: { $regex: search, $options: "i" } },
            { subjectCode: { $regex: search, $options: "i" } },
        ];
    }

    const totalSubjects = await Subject.countDocuments(query);

    const subjects = await Subject.find(query)
        .sort({ subjectName: 1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    res.status(200).json({
        success: true,
        message: "Subjects fetched successfully",
        totalSubjects,
        currentPage: Number(page),
        totalPages: Math.ceil(totalSubjects / limit),
        subjects,
    });
});

export const getSubjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid subject ID", 400);
    }

    const subject = await Subject.findById(id);

    if (!subject) {
        throw new AppError("Subject not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Subject fetched successfully",
        subject,
    });
});

export const updateSubject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { subjectName, subjectCode, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid subject ID", 400);
    }

    const subject = await Subject.findById(id);
    if (!subject) {
        throw new AppError("Subject not found", 404);
    }

    const finalSubjectCode = subjectCode ? subjectCode.toUpperCase().trim() : subject.subjectCode;

    if (subjectCode) {
        const duplicateSubject = await Subject.findOne({
            subjectCode: finalSubjectCode,
            _id: { $ne: id },
        });

        if (duplicateSubject) {
            throw new AppError(`Subject with code '${finalSubjectCode}' already exists`, 409);
        }
    }


    subject.subjectName = subjectName !== undefined ? subjectName.trim() : subject.subjectName;
    subject.subjectCode = finalSubjectCode;
    if (isActive !== undefined) {
        subject.isActive = isActive;
    }

    await subject.save();

    res.status(200).json({
        success: true,
        message: "Subject updated successfully",
        subject,
    });
});

export const deleteSubject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid subject ID", 400);
    }

    const referencedTimetable = await Timetable.findOne({
        "periods.subjectId": id,
        isActive: true,
    });

    if (referencedTimetable) {
        throw new AppError("Cannot delete subject because it is linked to an active timetable", 400);
    }

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
        throw new AppError("Subject not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
    });
});
