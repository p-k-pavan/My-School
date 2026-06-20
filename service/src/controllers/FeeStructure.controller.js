

// Create Fee Structure

import asyncHandler from "../middleware/asyncHandler.js";
import { Fee } from "../models/Fee.js";
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

    const isExist = await FeeStructure.findOne({
        academicYear,
        classLevel,
    });

    if (isExist) {
        throw new AppError(
            "Fee structure already exists",
            409
        );
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

    const feeStructures = await FeeStructure.find()
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
        throw new AppError(
            "Invalid Fee Structure ID",
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

    return res.status(200).json({
        success: true,
        message: "Fee Structure fetched successfully",
        feeStructure,
    });
});

// Update Fee Structure
export const updateFeeStructure = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        tuitionFee = 0,
        transportFee = 0,
        examFee = 0,
        libraryFee = 0,
        miscellaneousFee = 0,
        otherFee = 0,
    } = req.body;

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

    return res.status(200).json({
        success: true,
        message: "Fee Structure updated successfully",
        feeStructure,
    });
});

// Delete Fee Structure
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