import XLSX from "xlsx";
import fs from "fs";
import asyncHandler from "../middleware/asyncHandler.js";
import { Class } from "../models/class.model.js";
import AppError from "../utils/AppError.js";

export const createClass = asyncHandler(async (req, res) => {
    const { className, section, classTeacher } = req.body;

    if (!className || !section) {
        throw new AppError(
            "Class name and section are required",
            400
        );
    }

    const existingClass = await Class.findOne({
        className,
        section,
    });

    if (existingClass) {
        throw new AppError(
            "Class already exists",
            409
        );
    }

    const newClass = await Class.create({
        className,
        section,
        classTeacher,
    });

    res.status(201).json({
        success: true,
        message: "Class created successfully",
        class: newClass,
    });
});

export const bulkUploadClasses = asyncHandler(
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
            className,
            section,
            classTeacher,
          } = row;

          if (
            !className ||
            !section
          ) {
            errors.push({
              row: index + 2,
              error:
                "Class name and section are required",
            });
            continue;
          }

          const existingClass =
            await Class.findOne({
              className,
              section,
            });

          if (existingClass) {
            errors.push({
              row: index + 2,
              error:
                "Class already exists",
            });
            continue;
          }

          await Class.create({
            className,
            section,
            classTeacher:
              classTeacher ||
              null,
          });

          successCount++;
        } catch (error) {
          errors.push({
            row: index + 2,
            error:
              error.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        message:
          "Classes uploaded successfully",
        totalRecords:
          data.length,
        successCount,
        failedCount:
          errors.length,
        errors,
      });
    } finally {
      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }
    }
  }
);

export const getAllClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find().populate(
        "classTeacher",
        "teacherName email mobile"
    ).sort({ className: 1, section: 1 });

    res.status(200).json({
        success: true,
        message: "Classes fetched successfully",
        count: classes.length,
        classes
    });
}
);

export const getClassById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const klass = await Class.findById(id).populate(
        "classTeacher",
        "teacherName email mobile"
    );

    if (!klass) {
        throw new AppError(
            "Class not found",
            404
        );
    }

    res.status(200).json({
        success: true,
        message: "Class fetched successfully",
        class: klass,
    });
}
);

export const updateClass = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { className, section, classTeacher } = req.body;

    const klass = await Class.findById(id);

    if (!klass) {
        throw new AppError(
            "Class not found",
            404
        );
    }

    if (className && section) {
        const existingClass = await Class.findOne({
            className,
            section,
            _id: { $ne: id },
        });

        if (existingClass) {
            throw new AppError(
                "Class already exists",
                409
            );
        }
    }

    klass.className = className || klass.className;
    klass.section = section || klass.section;
    klass.classTeacher = classTeacher || klass.classTeacher;

    await klass.save();

    res.status(200).json({
        success: true,
        message: "Class successfully updated.",
        class: klass,
    });
});

export const deleteClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const klass = await Class.findByIdAndDelete(id)

    if (!klass) {
        throw new AppError(
            "Class not found",
            404
        );
    }

    res.status(200).json({
        success: true,
        message: "Class successfully deleted."
    });

})
