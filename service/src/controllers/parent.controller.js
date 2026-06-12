import XLSX from "xlsx";
import fs from "fs";
import asyncHandler from "../middleware/asyncHandler.js";
import { Parent } from "../models/parent.model.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { generatePassword } from "../utils/genaratePassword.js";
import mongoose from "mongoose";

export const createParent = asyncHandler(async (req, res) => {
  const {
    fatherName,
    motherName,
    fatherOccupation,
    motherOccupation,
    phoneNumber,
    alternatePhoneNumber,
    address,
    emergencyContact,
    relationWithStudent,
    email,
  } = req.body;

  if (
    !fatherName ||
    !motherName ||
    !phoneNumber ||
    !address ||
    !email
  ) {
    throw new AppError(
      "Required fields are missing",
      400
    );
  }

  const existingParent = await Parent.findOne({
    phoneNumber,
  });

  if (existingParent) {
    throw new AppError(
      "Parent already exists",
      409
    );
  }

  const existingUser = await User.findOne({
    $or: [
      { email },
      { mobile: phoneNumber },
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
    const password = await generatePassword(
      motherName,
      phoneNumber
    );

    newUser = await User.create({
      name: motherName,
      email,
      mobile: phoneNumber,
      role: "parent",
      password,
      isPasswordChanged: false,
    });

    const newParent = await Parent.create({
      userId: newUser._id,
      email,
      fatherName,
      motherName,
      fatherOccupation,
      motherOccupation,
      phoneNumber,
      alternatePhoneNumber,
      address,
      emergencyContact,
      relationWithStudent,
    });

    res.status(201).json({
      success: true,
      message: "Parent created successfully",
      parent: newParent,
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
        address,
        emergencyContact,
        relationWithStudent,
    } = req.body;

    const parent = await Parent.findById(id);

    if (!parent) {
        throw new AppError(
            "Parent not found",
            404
        );
    }

    const existingParent = await Parent.findOne({
        phoneNumber,
        _id: { $ne: id },
    });

    if (existingParent) {
        throw new AppError(
            "Phone number already exists",
            409
        );
    }

    parent.fatherName =
        fatherName || parent.fatherName;

    parent.motherName =
        motherName || parent.motherName;

    parent.fatherOccupation =
        fatherOccupation ||
        parent.fatherOccupation;

    parent.motherOccupation =
        motherOccupation ||
        parent.motherOccupation;

    parent.phoneNumber =
        phoneNumber || parent.phoneNumber;

    parent.alternatePhoneNumber =
        alternatePhoneNumber ||
        parent.alternatePhoneNumber;

    parent.address =
        address || parent.address;

    parent.emergencyContact =
        emergencyContact ||
        parent.emergencyContact;

    parent.relationWithStudent =
        relationWithStudent ||
        parent.relationWithStudent;

    await parent.save();

    res.status(200).json({
        success: true,
        message: "Parent updated successfully",
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

export const bulkUploadParents = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      throw new AppError(
        "Excel file is required",
        400
      );
    }

    const errors = [];
    let successCount = 0;

    try {
      const workbook = XLSX.readFile(
        req.file.path
      );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const data =
        XLSX.utils.sheet_to_json(
          worksheet
        );

      for (const [
        index,
        row,
      ] of data.entries()) {
        try {
          const {
            fatherName,
            motherName,
            phoneNumber,
            email,
            address,
          } = row;

          if (
            !fatherName ||
            !motherName ||
            !phoneNumber ||
            !email ||
            !address
          ) {
            errors.push({
              row: index + 2,
              error:
                "Required fields are missing",
            });
            continue;
          }

          const existingUser =
            await User.findOne({
              $or: [
                { email },
                {
                  mobile:
                    phoneNumber,
                },
              ],
            });

          if (existingUser) {
            errors.push({
              row: index + 2,
              error:
                "User already exists",
            });
            continue;
          }

          const password =
            await generatePassword(
              motherName,
              phoneNumber
            );

          const user =
            await User.create({
              name: motherName,
              email,
              mobile:
                phoneNumber,
              password,
              role: "parent",
              isPasswordChanged:
                false,
            });

          await Parent.create({
            userId: user._id,
            fatherName,
            motherName,
            email,
            phoneNumber,
            address,
            fatherOccupation:
              row.fatherOccupation,
            motherOccupation:
              row.motherOccupation,
            alternatePhoneNumber:
              row.alternatePhoneNumber,
            emergencyContact:
              row.emergencyContact,
            relationWithStudent:
              row.relationWithStudent,
          });

          successCount++;
        } catch (error) {
          errors.push({
            row: index + 2,
            error: error.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        message:
          "Parents uploaded successfully",
        totalRecords: data.length,
        successCount,
        failedCount: errors.length,
        errors,
      });
    } finally {
      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }
    }
  }
);