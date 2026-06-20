import asyncHandler from "../middleware/asyncHandler";
import { Fee } from "../models/Fee";
import { FeeStructure } from "../models/FeeStructure";
import { Student } from "../models/student.model";
import AppError from "../utils/AppError";



// createFee
export const createFee = asyncHandler(async (req, res) => {
    const {
        studentId,
        feeStructureId,
        academicYear,
        discountAmount = 0,
    } = req.body;

    if (!studentId || !feeStructureId || !academicYear) {
        throw new AppError(
            "Required fields are missing",
            400
        );
    }

    const [student, feeStructure] = await Promise.all([
        Student.findById(studentId),
        FeeStructure.findById(feeStructureId),
    ]);

    if (!student) {
        throw new AppError(
            "Student not found",
            404
        );
    }

    if (!feeStructure) {
        throw new AppError(
            "Fee Structure not found",
            404
        );
    }

    const existingFee = await Fee.findOne({
        studentId,
        academicYear,
    });

    if (existingFee) {
        throw new AppError(
            "Fee already assigned to this student",
            409
        );
    }

    const totalFee = feeStructure.totalFee;
    const dueAmount = totalFee - discountAmount;

    const fee = await Fee.create({
        studentId,
        feeStructureId,
        academicYear,
        totalFee,
        paidAmount: 0,
        dueAmount,
        discountAmount,
        status: dueAmount === 0 ? "paid" : "pending",
    });

    return res.status(201).json({
        success: true,
        message: "Fee created successfully",
        fee,
    });
});

//generateFeesForClass
export const generateFeesForClass = asyncHandler(async (req, res) => {
    const {
        classId,
        feeStructureId,
        academicYear,
    } = req.body;

    if (!classId || !feeStructureId || !academicYear) {
        throw new AppError(
            "Required fields are missing",
            400
        );
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
        status: "active",
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
    });
});

// getAllFees
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

    if (status) {
        filter.status = status;
    }

    if (academicYear) {
        filter.academicYear = academicYear;
    }

    let studentIds = [];

    if (classId || search) {
        const studentFilter = {};

        if (classId) {
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

        studentIds = students.map(
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
        .skip((page - 1) * limit)
        .limit(Number(limit));

    return res.status(200).json({
        success: true,
        count: fees.length,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        fees,
    });
});

// getFeeById
export const getFeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(
            "Invalid Fee ID",
            400
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
        fee,
    });
});

// getStudentFee
export const getFeeByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new AppError(
            "Invalid Student ID",
            400
        );
    }

    const student = await Student.findById(studentId);

    if (!student) {
        throw new AppError(
            "Student not found",
            404
        );
    }

    if (req.user.role === "parent" &&
        student.parentId.toString() !== req.user.id.toString()) {
        throw new AppError(
            "You are not authorized to access this student's fee details",
            403
        );
    }

    const fee = await Fee.findOne({ studentId, academicYear })
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
        fee,
    });
});

// getFeeByClass
export const getFeeByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError(
            "Invalid Class ID",
            400
        );
    }

    const klass = await Class.findById(classId);

    if (!klass) {
        throw new AppError(
            "Class not found",
            404
        );
    }

    const students = await Student.find({
        classId,
        status: "active",
    }).select("_id");

    const studentIds = students.map(
        (student) => student._id
    );

    const fees = await Fee.find({
        studentId: {
            $in: studentIds,
        },
    })
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

// updateFee
export const updateFee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { discountAmount = 0 } = req.body;

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

    if (discountAmount < 0) {
        throw new AppError(
            "Discount amount cannot be negative",
            400
        );
    }

    fee.discountAmount = discountAmount;

    fee.dueAmount =
        fee.totalFee -
        fee.paidAmount -
        discountAmount;

    const today = new Date();

    if (fee.dueAmount <= 0) {
        fee.status = "paid";
    } else if (today > fee.dueDate) {
        fee.status = "overdue";
    } else if (fee.paidAmount > 0) {
        fee.status = "partial";
    } else {
        fee.status = "pending";
    }

    await fee.save();

    return res.status(200).json({
        success: true,
        message: "Fee updated successfully",
        fee,
    });
});