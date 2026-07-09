// Create Fee Structure

import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Fee } from "../models/Fee.model.js";
import { FeeStructure } from "../models/FeeStructure.js";
import AppError from "../utils/AppError.js";

// Create Fee Structure
export const createFeeStructure = asyncHandler(async (req, res) => {
    const {
        academicYear,
        classLevel,
        tuitionFee = 0,
        transportFee = 0,
        examFee = 0,
        libraryFee = 0,
        miscellaneousFee = 0,
        otherFee = 0,
    } = req.body;

    if (!academicYear || !classLevel) {
        throw new AppError(
            "Academic year and class level are required",
            400
        );
    }

    const feeValues = [
        tuitionFee, transportFee, examFee,
        libraryFee, miscellaneousFee, otherFee,
    ];

    if (feeValues.some((f) => typeof f !== "number" || f < 0)) {
        throw new AppError( "Fee amounts must be non-negative numbers", 400 );
    }

    const isExist = await FeeStructure.findOne({
        academicYear,
        classLevel,
    });

    if (isExist) {
        throw new AppError( "Fee structure already exists", 409);
    }

    const totalFee =
        tuitionFee +
        transportFee +
        examFee +
        libraryFee +
        miscellaneousFee +
        otherFee;

    const feeStructure = await FeeStructure.create({
        academicYear,
        classLevel,
        tuitionFee,
        transportFee,
        examFee,
        libraryFee,
        miscellaneousFee,
        otherFee,
        totalFee,
    });

    return res.status(201).json({
        success: true,
        message: "Fee Structure created successfully",
        feeStructure,
    });
});

// Get All Fee Structure
export const getAllFeeStructure = asyncHandler(async (req, res) => {
    const { academicYear } = req.query;

    const filter = {};
    if (academicYear) {
        filter.academicYear = academicYear;
    }

    const feeStructures = await FeeStructure.find(filter)
        .sort({ classLevel: 1 });

    return res.status(200).json({
        success: true,
        count: feeStructures.length,
        feeStructures,
    });
});

// Get Fee Structure By Id
export const getFeeStructureById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError( "Invalid Fee Structure ID", 400 );
    }

    const feeStructure = await FeeStructure.findById(id);

    if (!feeStructure) {
        throw new AppError( "Fee Structure not found", 404 );
    }

    return res.status(200).json({
        success: true,
        message: "Fee Structure fetched successfully",
        feeStructure,
    });
});

// Get Fee Structure By Academic Year + Class Level
export const getFeeStructureByYearAndClass = asyncHandler(async (req, res) => {
    const { academicYear, classLevel } = req.query;

    if (!academicYear || !classLevel) {
        throw new AppError( "Academic year and class level are required", 400 );
    }

    const feeStructure = await FeeStructure.findOne({
        academicYear,
        classLevel,
    });

    if (!feeStructure) {
        throw new AppError(
            "Fee Structure not found",
            404
        );
    }

    return res.status(200).json({
        success: true,
        feeStructure,
    });
});

// Update Fee Structure
export const updateFeeStructure = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError( "Invalid Fee Structure ID", 400 );
    }

    const {
        tuitionFee = 0,
        transportFee = 0,
        examFee = 0,
        libraryFee = 0,
        miscellaneousFee = 0,
        otherFee = 0,
    } = req.body;

    const feeValues = [
        tuitionFee, transportFee, examFee,
        libraryFee, miscellaneousFee, otherFee,
    ];

    if (feeValues.some((f) => typeof f !== "number" || f < 0)) {
        throw new AppError(
            "Fee amounts must be non-negative numbers",
            400
        );
    }

    const feeStructure = await FeeStructure.findById(id);

    if (!feeStructure) {
        throw new AppError(
            "Fee Structure not found",
            404
        );
    }

    feeStructure.tuitionFee = tuitionFee;
    feeStructure.transportFee = transportFee;
    feeStructure.examFee = examFee;
    feeStructure.libraryFee = libraryFee;
    feeStructure.miscellaneousFee = miscellaneousFee;
    feeStructure.otherFee = otherFee;

    feeStructure.totalFee =
        tuitionFee +
        transportFee +
        examFee +
        libraryFee +
        miscellaneousFee +
        otherFee;

    await feeStructure.save();

    const assignedFeeCount = await Fee.countDocuments({ feeStructureId: id });

    return res.status(200).json({
        success: true,
        message: "Fee Structure updated successfully",
        feeStructure,
        ...(assignedFeeCount > 0 && {
            note: `${assignedFeeCount} student fee record(s) were already generated from this structure and were NOT changed — they keep their original totalFee.`,
        }),
    });
});

export const deleteFeeStructure = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(
            "Invalid Fee Structure ID",
            400
        );
    }

    const feeExists = await Fee.findOne({
        feeStructureId: id,
    });

    if (feeExists) {
        throw new AppError(
            "Fee structure is already assigned to students",
            400
        );
    }

    const feeStructure = await FeeStructure.findByIdAndDelete(id);

    if (!feeStructure) {
        throw new AppError(
            "Fee Structure not found",
            404
        );
    }

    return res.status(200).json({
        success: true,
        message: "Fee Structure deleted successfully",
    });
});