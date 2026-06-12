import XLSX from "xlsx";
import fs from "fs";
import asyncHandler from "../middleware/asyncHandler.js";
import { Parent } from "../models/parent.model.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { generatePassword } from "../utils/genaratePassword.js";
import mongoose from "mongoose";

export const getAllParents = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const totalParents = await Parent.countDocuments();

  const parents = await Parent.find()
    .populate(
      "userId",
      "name email mobile role status"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Parents fetched successfully",

    pagination: {
      totalRecords: totalParents,
      currentPage: page,
      totalPages: Math.ceil(
        totalParents / limit
      ),
      limit,
    },

    count: parents.length,
    parents,
  });
});

export const getParentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Parent ID", 400);
  }

  const parent = await Parent.findById(id)
    .populate(
      "userId",
      "name email mobile role status"
    );

  if (!parent) {
    throw new AppError("Parent not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Parent fetched successfully",
    parent,
  });
});

export const updateParent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        fatherName,
        motherName,
        fatherOccupation,
        motherOccupation,
        phoneNumber,
        alternatePhoneNumber,
        guardianName,
        guardianRelation,
        annualIncome,
        state,
        city,
        pincode,
        address,
    } = req.body;

    const parent = await Parent.findById(id);

    if (!parent) {
        throw new AppError(
            "Parent not found",
            404
        );
    }

    if (
        phoneNumber &&
        phoneNumber !== parent.phoneNumber
    ) {
        const existingParent =
            await Parent.findOne({
                phoneNumber,
                _id: { $ne: id },
            });

        if (existingParent) {
            throw new AppError(
                "Phone number already exists",
                409
            );
        }
    }

    if (fatherName !== undefined)
        parent.fatherName = fatherName;

    if (motherName !== undefined)
        parent.motherName = motherName;

    if (fatherOccupation !== undefined)
        parent.fatherOccupation =
            fatherOccupation;

    if (motherOccupation !== undefined)
        parent.motherOccupation =
            motherOccupation;

    if (phoneNumber !== undefined)
        parent.phoneNumber = phoneNumber;

    if (
        alternatePhoneNumber !==
        undefined
    )
        parent.alternatePhoneNumber =
            alternatePhoneNumber;

    if (guardianName !== undefined)
        parent.guardianName =
            guardianName;

    if (
        guardianRelation !==
        undefined
    )
        parent.guardianRelation =
            guardianRelation;

    if (annualIncome !== undefined)
        parent.annualIncome =
            annualIncome;

    if (state !== undefined)
        parent.state = state;

    if (city !== undefined)
        parent.city = city;

    if (pincode !== undefined)
        parent.pincode = pincode;

    if (address !== undefined)
        parent.address = address;

    await parent.save();

    res.status(200).json({
        success: true,
        message:
            "Parent updated successfully",
        parent,
    });
});

export const changeParentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const parent = await Parent.findById(id);

  if (!parent) {
    throw new AppError("Parent not found", 404);
  }

  parent.status = !parent.status;

  await parent.save();

  await User.findByIdAndUpdate(parent.userId, {
    status: parent.status,
  });

  res.status(200).json({
    success: true,
    message: `Parent ${parent.status ? "activated" : "deactivated"
      } successfully`,
    parent,
  });
});