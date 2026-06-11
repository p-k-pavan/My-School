import XLSX from "xlsx";
import asyncHandler from "../middleware/asyncHandler";
import { Class } from "../models/class.model";
import AppError from "../utils/AppError";

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

        const workbook = XLSX.readFile(req.file.path);

        const sheetName =
            workbook.SheetNames[0];

        const worksheet =
            workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(
            worksheet
        );

        const classes = data.map((row) => ({
            className: row.className,
            section: row.section,
            classTeacher: row.classTeacher || null,
        }));

        await Class.insertMany(classes, {
            ordered: false,
        });

        res.status(201).json({
            success: true,
            message: "Classes uploaded successfully",
            count: classes.length,
        });
    }
);

