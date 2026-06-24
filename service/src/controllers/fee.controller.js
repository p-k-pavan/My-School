import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Fee } from "../models/Fee.js";
import { FeeStructure } from "../models/FeeStructure.js";
import { Student } from "../models/student.model.js";
import { Class } from "../models/class.model.js";
import AppError from "../utils/AppError.js";
import ExcelJS from "exceljs";
import { Parent } from "../models/parent.model.js";
import { FeeTransaction } from "../models/payment.model.js";


const computeLiveStatus = (fee) => {
    if (fee.dueAmount <= 0) return "paid";
    const today = new Date();
    if (fee.dueDate && today > new Date(fee.dueDate)) return "overdue";
    if (fee.paidAmount > 0) return "partial";
    return "pending";
};

export const createFee = asyncHandler(async (req, res) => {
    const {
        studentId,
        feeStructureId,
        academicYear,
        discountAmount = 0,
        dueDate,
    } = req.body;

    if (!studentId || !feeStructureId || !academicYear) {
        throw new AppError("Required fields are missing", 400
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(studentId) ||
        !mongoose.Types.ObjectId.isValid(feeStructureId)
    ) {
        throw new AppError("Invalid Student or Fee Structure ID", 400
        );
    }

    if (typeof discountAmount !== "number" || discountAmount < 0) {
        throw new AppError("Discount amount cannot be negative", 400
        );
    }

    const [student, feeStructure] = await Promise.all([
        Student.findById(studentId),
        FeeStructure.findById(feeStructureId),
    ]);

    if (!student) {
        throw new AppError("Student not found", 404
        );
    }

    if (!feeStructure) {
        throw new AppError("Fee Structure not found", 404
        );
    }

    const existingFee = await Fee.findOne({
        studentId,
        academicYear,
    });

    if (existingFee) {
        throw new AppError("Fee already assigned to this student", 409
        );
    }

    const totalFee = feeStructure.totalFee;

    if (discountAmount > totalFee) {
        throw new AppError("Discount amount cannot exceed total fee", 400
        );
    }

    const dueAmount = totalFee - discountAmount;
    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const fee = await Fee.create({
        studentId,
        feeStructureId,
        academicYear,
        totalFee,
        paidAmount: 0,
        dueAmount,
        discountAmount,
        dueDate: parsedDueDate,
        status: dueAmount === 0 ? "paid" : "pending",
    });

    return res.status(201).json({
        success: true,
        message: "Fee created successfully",
        fee,
    });
});

export const generateFeesForClass = asyncHandler(async (req, res) => {
    const {
        classId,
        feeStructureId,
        academicYear,
        dueDate,
    } = req.body;

    if (!classId || !feeStructureId || !academicYear) {
        throw new AppError("Required fields are missing", 400);
    }

    if (
        !mongoose.Types.ObjectId.isValid(classId) ||
        !mongoose.Types.ObjectId.isValid(feeStructureId)
    ) {
        throw new AppError("Invalid Class or Fee Structure ID", 400);
    }

    const [klass, feeStructure] = await Promise.all([
        Class.findById(classId),
        FeeStructure.findById(feeStructureId),
    ]);

    if (!klass) {
        throw new AppError(
            "Class not found",
            404
        );
    }

    if (!feeStructure) {
        throw new AppError(
            "Fee Structure not found",
            404
        );
    }

    const students = await Student.find({
        classId,
        status: true,
    }).select("_id");

    if (students.length === 0) {
        throw new AppError(
            "No students found in this class",
            404
        );
    }

    const existingFees = await Fee.find({
        academicYear,
        studentId: {
            $in: students.map((s) => s._id),
        },
    }).select("studentId");

    const existingStudentIds = new Set(
        existingFees.map((f) => f.studentId.toString())
    );

    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const feeRecords = students
        .filter(
            (student) =>
                !existingStudentIds.has(
                    student._id.toString()
                )
        )
        .map((student) => ({
            studentId: student._id,
            feeStructureId,
            academicYear,
            totalFee: feeStructure.totalFee,
            paidAmount: 0,
            dueAmount: feeStructure.totalFee,
            discountAmount: 0,
            dueDate: parsedDueDate,
            status: "pending",
        }));

    if (feeRecords.length > 0) {
        await Fee.insertMany(feeRecords, {
            ordered: false,
        });
    }

    return res.status(201).json({
        success: true,
        message: `${feeRecords.length} fee records generated successfully`,
        count: feeRecords.length,
        skipped: students.length - feeRecords.length,
    });
});

export const getAllFees = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        academicYear,
        classId,
        search,
    } = req.query;

    const filter = {};

    if (status === "overdue") {
        filter.dueAmount = { $gt: 0 };
        filter.dueDate = { $lt: new Date() };
    } else if (status) {
        filter.status = status;
    }

    if (academicYear) {
        filter.academicYear = academicYear;
    }

    if (classId || search) {
        const studentFilter = {};

        if (classId) {
            if (!mongoose.Types.ObjectId.isValid(classId)) {
                throw new AppError("Invalid Class ID", 400);
            }
            studentFilter.classId = classId;
        }

        if (search) {
            studentFilter.$or = [
                {
                    studentName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    admissionNo: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const students = await Student.find(studentFilter)
            .select("_id");

        const studentIds = students.map(
            (student) => student._id
        );

        filter.studentId = {
            $in: studentIds,
        };
    }

    const total = await Fee.countDocuments(filter);

    const fees = await Fee.find(filter)
        .populate({
            path: "studentId",
            select: "studentName admissionNo rollNo classId",
            populate: {
                path: "classId",
                select: "className section",
            },
        })
        .populate(
            "feeStructureId",
            "academicYear classLevel totalFee"
        )
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();

    const feesWithLiveStatus = fees.map((fee) => ({
        ...fee,
        status: computeLiveStatus(fee),
    }));

    return res.status(200).json({
        success: true,
        count: fees.length,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        fees: feesWithLiveStatus,
    });
});

export const getFeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Fee ID", 400
        );
    }

    const fee = await Fee.findById(id)
        .populate({
            path: "studentId",
            select: "admissionNo studentName rollNo classId",
            populate: {
                path: "classId",
                select: "className section",
            },
        })
        .populate(
            "feeStructureId",
            "academicYear classLevel totalFee"
        );

    if (!fee) {
        throw new AppError(
            "Fee details not found",
            404
        );
    }

    return res.status(200).json({
        success: true,
        message: "Fee fetched successfully",
        fee: {
            ...fee.toObject(),
            status: computeLiveStatus(fee),
        },
    });
});

export const getFeeByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const academicYear = req.query.academicYear || "2026-2027";

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new AppError("Invalid Student ID", 400
        );
    }

    const student = await Student.findById(studentId);

    if (!student) {
        throw new AppError("Student not found", 404
        );
    }

    const parent = await Parent.findOne({
        userId: req.user.id,
    });

    if (!parent) {
        throw new AppError("Parent not found", 404);
    }

    if (req.user.role === "parent" &&
        student.parentId.toString() !== parent._id.toString()) {
        throw new AppError(
            `You are not authorized to access this student's fee details `,
            403
        );
    }

    const query = { studentId };
    if (academicYear) {
        query.academicYear = academicYear;
    }

    const fees = await Fee.findOne(query)
    .populate("feeStructureId","academicYear tuitionFee examFee libraryFee miscellaneousFee otherFee totalFee");

    if (!fees) {
        throw new AppError("Fee details not found", 404);
    }

    const transcation = await FeeTransaction.find({ studentFeeId: fees._id });

    return res.status(200).json({
        success: true,
        message: "Fee fetched successfully",
        transcation,
            fees,
            status: computeLiveStatus(fees),
    });
});

export const getFeeByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { academicYear } = req.query;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid Class ID", 400);
    }

    const klass = await Class.findById(classId);

    if (!klass) {
        throw new AppError("Class not found", 404);
    }

    const students = await Student.find({
        classId,
        status: true,
    }).select("_id");

    const studentIds = students.map(
        (student) => student._id
    );

    const filter = {
        studentId: {
            $in: studentIds,
        },
    };

    if (academicYear) {
        filter.academicYear = academicYear;
    }

    const fees = await Fee.find(filter)
        .populate({
            path: "studentId",
            select: "admissionNo studentName rollNo",
        })
        .sort({
            createdAt: -1,
        });

    return res.status(200).json({
        success: true,
        count: fees.length,
        fees,
    });
});

export const updateFee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { discountAmount = 0 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Fee ID", 400);
    }

    if (typeof discountAmount !== "number" || discountAmount < 0) {
        throw new AppError("Discount amount cannot be negative", 400);
    }

    const fee = await Fee.findById(id);

    if (!fee) {
        throw new AppError("Fee record not found", 404);
    }

    if (discountAmount + fee.paidAmount > fee.totalFee) {
        throw new AppError(
            "Discount combined with amount already paid cannot exceed total fee",
            400
        );
    }

    fee.discountAmount = discountAmount;

    fee.dueAmount =
        fee.totalFee -
        fee.paidAmount -
        discountAmount;

    fee.status = computeLiveStatus(fee);

    await fee.save();

    return res.status(200).json({
        success: true,
        message: "Fee updated successfully",
        fee,
    });
});

export const deleteFee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(
            "Invalid Fee ID",
            400
        );
    }

    const fee = await Fee.findById(id);

    if (!fee) {
        throw new AppError(
            "Fee record not found",
            404
        );
    }

    if (fee.paidAmount > 0) {
        throw new AppError(
            "Cannot delete a fee record that already has payments recorded against it",
            400
        );
    }

    await Fee.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Fee record deleted successfully",
    });
});

// generateFeesForSchool
export const generateFeesForSchool = asyncHandler(async (req, res) => {
    const { academicYear, assignments, dueDate } = req.body;

    if (!academicYear || !Array.isArray(assignments) || assignments.length === 0) {
        throw new AppError(
            "academicYear and a non-empty assignments array (classId + feeStructureId pairs) are required",
            400
        );
    }

    for (const a of assignments) {
        if (
            !a.classId || !a.feeStructureId ||
            !mongoose.Types.ObjectId.isValid(a.classId) ||
            !mongoose.Types.ObjectId.isValid(a.feeStructureId)
        ) {
            throw new AppError(
                "Each assignment needs a valid classId and feeStructureId",
                400
            );
        }
    }

    const feeStructureIds = [...new Set(assignments.map((a) => a.feeStructureId))];
    const feeStructures = await FeeStructure.find({ _id: { $in: feeStructureIds } });
    const structureMap = new Map(
        feeStructures.map((fs) => [fs._id.toString(), fs])
    );

    const results = [];
    let totalGenerated = 0;

    for (const { classId, feeStructureId } of assignments) {
        const feeStructure = structureMap.get(feeStructureId.toString());

        if (!feeStructure) {
            results.push({ classId, generated: 0, error: "Fee structure not found" });
            continue;
        }

        const students = await Student.find({
            classId,
            status: true,
        }).select("_id");

        if (students.length === 0) {
            results.push({ classId, generated: 0, error: "No active students in class" });
            continue;
        }

        const existingFees = await Fee.find({
            academicYear,
            studentId: { $in: students.map((s) => s._id) },
        }).select("studentId");

        const existingStudentIds = new Set(
            existingFees.map((f) => f.studentId.toString())
        );

        const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const feeRecords = students
            .filter((s) => !existingStudentIds.has(s._id.toString()))
            .map((s) => ({
                studentId: s._id,
                feeStructureId,
                academicYear,
                totalFee: feeStructure.totalFee,
                paidAmount: 0,
                dueAmount: feeStructure.totalFee,
                discountAmount: 0,
                dueDate: parsedDueDate,
                status: "pending",
            }));

        if (feeRecords.length > 0) {
            await Fee.insertMany(feeRecords, { ordered: false });
        }

        totalGenerated += feeRecords.length;
        results.push({
            classId,
            generated: feeRecords.length,
            skippedAlreadyAssigned: students.length - feeRecords.length,
        });
    }

    return res.status(201).json({
        success: true,
        message: `${totalGenerated} fee record(s) generated across ${assignments.length} class(es)`,
        totalGenerated,
        results,
    });
});

// getFeeDashboard 
export const getFeeDashboard = asyncHandler(async (req, res) => {
    const { academicYear, classId } = req.query;

    const matchStage = {};
    if (academicYear) matchStage.academicYear = academicYear;

    if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            throw new AppError("Invalid Class ID", 400);
        }
        const students = await Student.find({ classId }).select("_id");
        matchStage.studentId = { $in: students.map((s) => s._id) };
    }

    const today = new Date();

    const [summary] = await Fee.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalStudents: { $sum: 1 },
                totalExpected: {
                    $sum: { $subtract: ["$totalFee", "$discountAmount"] },
                },
                totalCollected: { $sum: "$paidAmount" },
                totalDue: { $sum: "$dueAmount" },
                paidCount: {
                    $sum: { $cond: [{ $lte: ["$dueAmount", 0] }, 1, 0] },
                },
                overdueCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $gt: ["$dueAmount", 0] },
                                    { $lt: ["$dueDate", today] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                partialCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $gt: ["$paidAmount", 0] },
                                    { $gt: ["$dueAmount", 0] },
                                    { $gte: ["$dueDate", today] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                pendingCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$paidAmount", 0] },
                                    { $gt: ["$dueAmount", 0] },
                                    { $gte: ["$dueDate", today] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    if (!summary) {
        return res.status(200).json({
            success: true,
            summary: {
                totalStudents: 0,
                totalExpected: 0,
                totalCollected: 0,
                totalDue: 0,
                collectionPercentage: 0,
                paidCount: 0,
                overdueCount: 0,
                partialCount: 0,
                pendingCount: 0,
            },
        });
    }

    delete summary._id;
    summary.collectionPercentage =
        summary.totalExpected > 0
            ? Number(
                ((summary.totalCollected / summary.totalExpected) * 100).toFixed(2)
            )
            : 0;

    return res.status(200).json({
        success: true,
        summary,
    });
});

// getDefaulters — students with overdue, unpaid balances
export const getDefaulters = asyncHandler(async (req, res) => {
    const { academicYear, classId, page = 1, limit = 20 } = req.query;

    const filter = {
        dueAmount: { $gt: 0 },
        dueDate: { $lt: new Date() },
    };

    if (academicYear) filter.academicYear = academicYear;

    if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            throw new AppError("Invalid Class ID", 400);
        }
        const students = await Student.find({ classId }).select("_id");
        filter.studentId = { $in: students.map((s) => s._id) };
    }

    const total = await Fee.countDocuments(filter);

    const defaulters = await Fee.find(filter)
        .populate({
            path: "studentId",
            select: "studentName admissionNo rollNo classId parentId",
            populate: { path: "classId", select: "className section" },
        })
        .sort({ dueDate: 1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();

    return res.status(200).json({
        success: true,
        count: defaulters.length,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        defaulters: defaulters.map((fee) => ({
            ...fee,
            daysOverdue: Math.floor(
                (Date.now() - new Date(fee.dueDate)) / (1000 * 60 * 60 * 24)
            ),
        })),
    });
});

export const exportFeesToExcel = asyncHandler(async (req, res) => {
    const { academicYear, classId, status } = req.query;

    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            throw new AppError("Invalid Class ID", 400);
        }
        const students = await Student.find({ classId }).select("_id");
        filter.studentId = { $in: students.map((s) => s._id) };
    }

    const fees = await Fee.find(filter)
        .populate({
            path: "studentId",
            select: "studentName admissionNo rollNo classId",
            populate: { path: "classId", select: "className section" },
        })
        .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Fees");

    sheet.columns = [
        { header: "Admission No", key: "admissionNo", width: 15 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Class", key: "className", width: 12 },
        { header: "Academic Year", key: "academicYear", width: 14 },
        { header: "Total Fee", key: "totalFee", width: 12 },
        { header: "Discount", key: "discountAmount", width: 12 },
        { header: "Paid", key: "paidAmount", width: 12 },
        { header: "Due", key: "dueAmount", width: 12 },
        { header: "Status", key: "status", width: 12 },
    ];

    fees.forEach((fee) => {
        sheet.addRow({
            admissionNo: fee.studentId?.admissionNo || "-",
            studentName: fee.studentId?.studentName || "-",
            className: fee.studentId?.classId
                ? `${fee.studentId.classId.className}-${fee.studentId.classId.section}`
                : "-",
            academicYear: fee.academicYear,
            totalFee: fee.totalFee,
            discountAmount: fee.discountAmount,
            paidAmount: fee.paidAmount,
            dueAmount: fee.dueAmount,
            status: fee.status,
        });
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=fees-export-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
});