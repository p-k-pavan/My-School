import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Fee } from "../models/Fee.js";
import { FeeTransaction } from "../models/payment.model.js";
import { Student } from "../models/student.model.js";
import AppError from "../utils/AppError.js";
import PDFDocument from "pdfkit"; 
import ExcelJS from "exceljs"; 


const commitWithRetry = async (session) => {
    while (true) {
        try {
            await session.commitTransaction();
            return;
        } catch (error) {
            if (error.hasErrorLabel?.("TransientTransactionError")) {
                continue;
            }
            throw error;
        }
    }
};

export const createFeePayment = asyncHandler(async (req, res) => {
    const {
        studentId,
        studentFeeId,
        amount,
        paymentMethod,
        transactionId,
        remarks,
    } = req.body;

    if (!studentId || !studentFeeId || !amount || !paymentMethod) {
        throw new AppError( "Required fields are missing", 400 );
    }

    if (
        !mongoose.Types.ObjectId.isValid(studentId) ||
        !mongoose.Types.ObjectId.isValid(studentFeeId)
    ) {
        throw new AppError( "Invalid Student or Fee ID", 400);
    }

    if (typeof amount !== "number" || amount <= 0) {
        throw new AppError( "Amount must be a positive number", 400 );
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const [student, fee] = await Promise.all([
            Student.findById(studentId).session(session),
            Fee.findById(studentFeeId).session(session),
        ]);

        if (!student) {
            throw new AppError("Student not found", 404);
        }

        if (!fee) {
            throw new AppError("Fee record not found", 404);
        }

        if (amount > fee.dueAmount) {
            throw new AppError( "Amount exceeds due amount", 400 );
        }

        const payment = await FeeTransaction.create(
            [{
                studentId,
                studentFeeId,
                amount,
                paymentMethod,
                transactionId,
                paymentStatus: "success",
                remarks,
                paymentDate: new Date(),
                collectedBy: req.user.id,
            }],
            { session }
        );

        payment[0].receiptNo =
            "REC" +
            payment[0]._id
                .toString()
                .slice(-6)
                .toUpperCase();

        await payment[0].save({ session });

        fee.paidAmount += amount;

        fee.dueAmount =
            fee.totalFee -
            fee.discountAmount -
            fee.paidAmount;

        fee.status = fee.dueAmount <= 0 ? "paid" : "partial";

        await fee.save({ session });

        await commitWithRetry(session);

        return res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            payment: payment[0],
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const getFeePaymentByStudentId = asyncHandler(async (req, res) => {

    const { studentId } = req.params;
    const { academicYear } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new AppError( "Invalid Student ID", 400 );
    }

    const student = await Student.findById(studentId);

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    const filter = { studentId };

    if (academicYear) {
        const feesForYear = await Fee.find({ studentId, academicYear }).select("_id");
        filter.studentFeeId = { $in: feesForYear.map((f) => f._id) };
    }

    const payments = await FeeTransaction.find(filter)
        .sort({ paymentDate: -1 });

    return res.status(200).json({
        success: true,
        message: "Payment fetched successfully",
        count: payments.length,
        payments,
    });
});

export const getFeePaymentById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError( "Invalid Payment ID", 400 );
    }

    const payment = await FeeTransaction.findById(id);

    if (!payment) {
        throw new AppError( "Payment not found", 404 );
    }

    return res.status(200).json({
        success: true,
        message: "Payment fetched successfully",
        payment,
    });
});

export const getAllFeePayments = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        paymentMethod,
        paymentStatus,
        studentId,
        startDate,
        endDate,
    } = req.query;

    const filter = {};

    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    if (studentId) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw new AppError("Invalid Student ID", 400);
        }
        filter.studentId = studentId;
    }

    if (startDate || endDate) {
        filter.paymentDate = {};
        if (startDate) filter.paymentDate.$gte = new Date(startDate);
        if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const total = await FeeTransaction.countDocuments(filter);

    const payments = await FeeTransaction.find(filter)
        .populate(
            "studentId",
            "studentName admissionNo rollNo"
        )
        .populate(
            "studentFeeId",
            "academicYear totalFee paidAmount dueAmount"
        )
        .populate(
            "collectedBy",
            "name"
        )
        .sort({ paymentDate: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();

    return res.status(200).json({
        success: true,
        count: payments.length,
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        payments,
    });
});

export const voidFeePayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Payment ID", 400);
    }
 
    if (!reason || !reason.trim()) {
        throw new AppError("A reason is required to void a payment", 400);
    }
 
    const session = await mongoose.startSession();
 
    try {
        session.startTransaction();
 
        const payment = await FeeTransaction.findById(id).session(session);
 
        if (!payment) {
            throw new AppError("Payment not found", 404);
        }
 
        if (payment.paymentStatus === "voided") {
            throw new AppError("Payment has already been voided", 400);
        }
 
        const fee = await Fee.findById(payment.studentFeeId).session(session);
 
        if (!fee) {
            throw new AppError("Associated fee record not found", 404);
        }
 
        fee.paidAmount = Math.max(0, fee.paidAmount - payment.amount);
        fee.dueAmount = fee.totalFee - fee.discountAmount - fee.paidAmount;
 
        const today = new Date();
        if (fee.dueAmount <= 0) {
            fee.status = "paid";
        } else if (fee.dueDate && today > fee.dueDate) {
            fee.status = "overdue";
        } else if (fee.paidAmount > 0) {
            fee.status = "partial";
        } else {
            fee.status = "pending";
        }
 
        await fee.save({ session });
 
        payment.paymentStatus = "voided";
        payment.voidReason = reason;
        payment.voidedBy = req.user.id;
        payment.voidedAt = new Date();
 
        await payment.save({ session });
 
        await commitWithRetry(session);
 
        return res.status(200).json({
            success: true,
            message: "Payment voided successfully",
            payment,
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
 
// downloadFeeReceipt
export const downloadFeeReceipt = asyncHandler(async (req, res) => {
    const { id } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid Payment ID", 400);
    }
 
    const payment = await FeeTransaction.findById(id)
        .populate("studentId", "studentName admissionNo rollNo")
        .populate("studentFeeId", "academicYear totalFee")
        .populate("collectedBy", "name");
 
    if (!payment) {
        throw new AppError("Payment not found", 404);
    }
 
    if (payment.paymentStatus === "voided") {
        throw new AppError("Cannot generate a receipt for a voided payment", 400);
    }
 
    const doc = new PDFDocument({ size: "A5", margin: 40 });
 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=receipt-${payment.receiptNo || payment._id}.pdf`
    );
 
    doc.pipe(res);
 
    doc.fontSize(16).text("Fee Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Receipt No: ${payment.receiptNo || "-"}`);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Student: ${payment.studentId?.studentName || "-"}`);
    doc.text(`Admission No: ${payment.studentId?.admissionNo || "-"}`);
    doc.text(`Academic Year: ${payment.studentFeeId?.academicYear || "-"}`);
    doc.moveDown();
    doc.fontSize(12).text(`Amount Paid: Rs. ${payment.amount}`, { underline: true });
    doc.fontSize(10);
    doc.text(`Payment Method: ${payment.paymentMethod}`);
    if (payment.transactionId) doc.text(`Transaction ID: ${payment.transactionId}`);
    doc.text(`Collected By: ${payment.collectedBy?.name || "-"}`);
    if (payment.remarks) doc.text(`Remarks: ${payment.remarks}`);
    doc.moveDown(2);
    doc.fontSize(8).text("This is a system-generated receipt.", { align: "center" });
 
    doc.end();
});
 
// exportPaymentsToExcel
export const exportPaymentsToExcel = asyncHandler(async (req, res) => {
    const { studentId, paymentMethod, paymentStatus, startDate, endDate } = req.query;
 
    const filter = {};
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
 
    if (studentId) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw new AppError("Invalid Student ID", 400);
        }
        filter.studentId = studentId;
    }
 
    if (startDate || endDate) {
        filter.paymentDate = {};
        if (startDate) filter.paymentDate.$gte = new Date(startDate);
        if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }
 
    const payments = await FeeTransaction.find(filter)
        .populate("studentId", "studentName admissionNo")
        .populate("collectedBy", "name")
        .sort({ paymentDate: -1 })
        .lean();
 
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payments");
 
    sheet.columns = [
        { header: "Receipt No", key: "receiptNo", width: 14 },
        { header: "Date", key: "date", width: 14 },
        { header: "Admission No", key: "admissionNo", width: 15 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Amount", key: "amount", width: 12 },
        { header: "Method", key: "paymentMethod", width: 12 },
        { header: "Status", key: "paymentStatus", width: 12 },
        { header: "Collected By", key: "collectedBy", width: 18 },
    ];
 
    payments.forEach((p) => {
        sheet.addRow({
            receiptNo: p.receiptNo || "-",
            date: new Date(p.paymentDate).toLocaleDateString(),
            admissionNo: p.studentId?.admissionNo || "-",
            studentName: p.studentId?.studentName || "-",
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            paymentStatus: p.paymentStatus,
            collectedBy: p.collectedBy?.name || "-",
        });
    });
 
    sheet.getRow(1).font = { bold: true };
 
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=payments-export-${Date.now()}.xlsx`
    );
 
    await workbook.xlsx.write(res);
    res.end();
});