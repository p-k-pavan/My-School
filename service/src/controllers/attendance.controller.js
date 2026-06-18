import mongoose from "mongoose";
import Attendance from "../models/attendance.model.js";
import { Class } from "../models/class.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Parent } from "../models/parent.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";


const calculateAttendanceCounts = (attendanceArray) => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    attendanceArray.forEach((entry) => {
        if (entry.status === "P") presentCount++;
        else if (entry.status === "A") absentCount++;
        else if (entry.status === "L") lateCount++;
        else if (entry.status === "HD") halfDayCount++;
    });

    return {
        totalStudents: attendanceArray.length,
        presentCount,
        absentCount,
        lateCount,
        halfDayCount,
    };
};


export const markAttendance = asyncHandler(async (req, res) => {
    const { classId, attendanceDate, attendance, markedBy: bodyMarkedBy } = req.body;

    if (!classId || !attendanceDate || !attendance || !Array.isArray(attendance)) {
        throw new AppError("Class ID, date, and attendance records are required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    let markedBy = bodyMarkedBy;
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (!teacher) {
            throw new AppError("Teacher record not found for this user", 404);
        }
        markedBy = teacher._id;
    } else {
        if (!markedBy) {
            const klass = await Class.findById(classId);
            if (klass && klass.classTeacher) {
                markedBy = klass.classTeacher;
            } else {
                throw new AppError("markedBy (Teacher ID) is required for admin/management when no class teacher is set", 400);
            }
        }
    }

    if (!mongoose.Types.ObjectId.isValid(markedBy)) {
        throw new AppError("Invalid Teacher ID for markedBy", 400);
    }

    const parsedDate = new Date(attendanceDate);
    if (isNaN(parsedDate.getTime())) {
        throw new AppError("Invalid date format", 400);
    }

    parsedDate.setUTCHours(0, 0, 0, 0);

    const counts = calculateAttendanceCounts(attendance);

    const attendanceRecord = await Attendance.findOneAndUpdate(
        { classId, attendanceDate: parsedDate },
        {
            markedBy,
            attendance,
            ...counts,
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
        }
    );

    res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        attendanceRecord,
    });
});


export const getAttendanceByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new AppError("Invalid student ID", 400);
    }

    if (req.user.role === "parent") {
        const parent = await Parent.findOne({ userId: req.user.id });
        if (!parent || !parent.studentIds.map(id => id.toString()).includes(studentId)) {
            throw new AppError("Access denied. You can only view attendance for your own children", 403);
        }
    }

    const matchStage = {
        "attendance.studentId": new mongoose.Types.ObjectId(studentId),
    };

    if (startDate || endDate) {
        matchStage.attendanceDate = {};
        if (startDate) {
            const sDate = new Date(startDate);
            sDate.setUTCHours(0, 0, 0, 0);
            matchStage.attendanceDate.$gte = sDate;
        }
        if (endDate) {
            const eDate = new Date(endDate);
            eDate.setUTCHours(23, 59, 59, 999);
            matchStage.attendanceDate.$lte = eDate;
        }
    }

    const result = await Attendance.aggregate([
        { $match: matchStage },
        { $unwind: "$attendance" },
        { $match: { "attendance.studentId": new mongoose.Types.ObjectId(studentId) } },
        { $sort: { attendanceDate: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: (Number(page) - 1) * Number(limit) },
                    { $limit: Number(limit) },
                    {
                        $lookup: {
                            from: "classes",
                            localField: "classId",
                            foreignField: "_id",
                            as: "classInfo",
                        },
                    },
                    {
                        $lookup: {
                            from: "teachers",
                            localField: "markedBy",
                            foreignField: "_id",
                            as: "teacherInfo",
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            attendanceDate: 1,
                            status: "$attendance.status",
                            remarks: "$attendance.remarks",
                            class: { $arrayElemAt: ["$classInfo", 0] },
                            markedByTeacher: { $arrayElemAt: ["$teacherInfo", 0] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            attendanceDate: 1,
                            status: 1,
                            remarks: 1,
                            "class._id": 1,
                            "class.className": 1,
                            "class.section": 1,
                            "markedByTeacher._id": 1,
                            "markedByTeacher.teacherName": 1,
                        },
                    },
                ],
            },
        },
    ]);

    const total = result[0]?.metadata[0]?.total || 0;
    const records = result[0]?.data || [];

    res.status(200).json({
        success: true,
        message: "Student attendance fetched successfully",
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        records,
    });
});


export const getAttendanceByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { date, startDate, endDate, includeDetails } = req.query;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    if (date) {
        const parsedDate = new Date(date);
        parsedDate.setUTCHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ classId, attendanceDate: parsedDate })
            .populate("attendance.studentId", "studentName rollNo admissionNo")
            .populate("markedBy", "teacherName employeeId");

        if (!attendance) {
            return res.status(200).json({
                success: true,
                message: "Attendance has not been marked for this class on the selected date",
                attendance: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attendance fetched successfully",
            attendance,
        });
    } else {
        const query = { classId };

        if (startDate || endDate) {
            query.attendanceDate = {};
            if (startDate) {
                const sDate = new Date(startDate);
                sDate.setUTCHours(0, 0, 0, 0);
                query.attendanceDate.$gte = sDate;
            }
            if (endDate) {
                const eDate = new Date(endDate);
                eDate.setUTCHours(23, 59, 59, 999);
                query.attendanceDate.$lte = eDate;
            }
        }

        let dbQuery = Attendance.find(query);
        if (includeDetails === "true") {
            dbQuery = dbQuery.populate("attendance.studentId", "studentName rollNo admissionNo");
        } else {
            dbQuery = dbQuery.select("-attendance");
        }

        const attendanceHistory = await dbQuery
            .populate("markedBy", "teacherName")
            .sort({ attendanceDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Class attendance history fetched successfully",
            count: attendanceHistory.length,
            records: attendanceHistory,
        });
    }
});


export const getAttendanceSummary = asyncHandler(async (req, res) => {
    const { studentId, classId, startDate, endDate } = req.query;

    const dateFilter = {};
    const hasDateFilter = startDate || endDate;
    if (startDate) {
        const sDate = new Date(startDate);
        sDate.setUTCHours(0, 0, 0, 0);
        dateFilter.$gte = sDate;
    }
    if (endDate) {
        const eDate = new Date(endDate);
        eDate.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = eDate;
    }

    if (studentId) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw new AppError("Invalid student ID", 400);
        }

        if (req.user.role === "parent") {
            const parent = await Parent.findOne({ userId: req.user.id });
            if (!parent || !parent.studentIds.map(id => id.toString()).includes(studentId)) {
                throw new AppError("Access denied. You can only view stats for your own children", 403);
            }
        }

        const matchStage = {
            "attendance.studentId": new mongoose.Types.ObjectId(studentId),
        };
        if (hasDateFilter) {
            matchStage.attendanceDate = dateFilter;
        }

        const stats = await Attendance.aggregate([
            { $match: matchStage },
            { $unwind: "$attendance" },
            { $match: { "attendance.studentId": new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: null,
                    totalDays: { $sum: 1 },
                    presentCount: { $sum: { $cond: [{ $eq: ["$attendance.status", "P"] }, 1, 0] } },
                    absentCount: { $sum: { $cond: [{ $eq: ["$attendance.status", "A"] }, 1, 0] } },
                    lateCount: { $sum: { $cond: [{ $eq: ["$attendance.status", "L"] }, 1, 0] } },
                    halfDayCount: { $sum: { $cond: [{ $eq: ["$attendance.status", "HD"] }, 1, 0] } },
                },
            },
        ]);

        const summary = stats[0] || {
            totalDays: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            halfDayCount: 0,
        };

        const presentWeight = summary.presentCount + summary.lateCount + (summary.halfDayCount * 0.5);
        const percentage = summary.totalDays > 0 ? Math.round((presentWeight / summary.totalDays) * 100) : 0;

        return res.status(200).json({
            success: true,
            summary: {
                ...summary,
                attendancePercentage: percentage,
            },
        });
    }

    if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            throw new AppError("Invalid class ID", 400);
        }

        const matchStage = { classId: new mongoose.Types.ObjectId(classId) };
        if (hasDateFilter) {
            matchStage.attendanceDate = dateFilter;
        }

        const stats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalDays: { $sum: 1 },
                    sumTotalStudents: { $sum: "$totalStudents" },
                    sumPresent: { $sum: "$presentCount" },
                    sumAbsent: { $sum: "$absentCount" },
                    sumLate: { $sum: "$lateCount" },
                    sumHalfDay: { $sum: "$halfDayCount" },
                },
            },
        ]);

        const summary = stats[0] || {
            totalDays: 0,
            sumTotalStudents: 0,
            sumPresent: 0,
            sumAbsent: 0,
            sumLate: 0,
            sumHalfDay: 0,
        };

        const totalActiveStudents = summary.sumTotalStudents;
        const attendedWeight = summary.sumPresent + summary.sumLate + (summary.sumHalfDay * 0.5);
        const averagePercentage = totalActiveStudents > 0 ? Math.round((attendedWeight / totalActiveStudents) * 100) : 0;

        return res.status(200).json({
            success: true,
            summary: {
                totalDays: summary.totalDays,
                totalStudentsSum: summary.sumTotalStudents,
                presentSum: summary.sumPresent,
                absentSum: summary.sumAbsent,
                lateSum: summary.sumLate,
                halfDaySum: summary.sumHalfDay,
                averageAttendancePercentage: averagePercentage,
            },
        });
    }

    if (req.user.role !== "admin" && req.user.role !== "management") {
        throw new AppError("Access denied. School-wide statistics are restricted", 403);
    }

    const matchStage = {};
    if (hasDateFilter) {
        matchStage.attendanceDate = dateFilter;
    }

    const stats = await Attendance.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalDays: { $sum: 1 },
                sumTotalStudents: { $sum: "$totalStudents" },
                sumPresent: { $sum: "$presentCount" },
                sumAbsent: { $sum: "$absentCount" },
                sumLate: { $sum: "$lateCount" },
                sumHalfDay: { $sum: "$halfDayCount" },
            },
        },
    ]);

    const summary = stats[0] || {
        totalDays: 0,
        sumTotalStudents: 0,
        sumPresent: 0,
        sumAbsent: 0,
        sumLate: 0,
        sumHalfDay: 0,
    };

    const totalActiveStudents = summary.sumTotalStudents;
    const attendedWeight = summary.sumPresent + summary.sumLate + (summary.sumHalfDay * 0.5);
    const averagePercentage = totalActiveStudents > 0 ? Math.round((attendedWeight / totalActiveStudents) * 100) : 0;

    return res.status(200).json({
        success: true,
        summary: {
            totalClassesAttendanceRecords: summary.totalDays,
            totalStudentsSum: summary.sumTotalStudents,
            presentSum: summary.sumPresent,
            absentSum: summary.sumAbsent,
            lateSum: summary.sumLate,
            halfDaySum: summary.sumHalfDay,
            averageAttendancePercentage: averagePercentage,
        },
    });
});


export const updateAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { attendance } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid attendance record ID", 400);
    }

    if (!attendance || !Array.isArray(attendance)) {
        throw new AppError("Attendance list is required", 400);
    }

    const attendanceRecord = await Attendance.findById(id);

    if (!attendanceRecord) {
        throw new AppError("Attendance record not found", 404);
    }

    const counts = calculateAttendanceCounts(attendance);

    attendanceRecord.attendance = attendance;
    attendanceRecord.totalStudents = counts.totalStudents;
    attendanceRecord.presentCount = counts.presentCount;
    attendanceRecord.absentCount = counts.absentCount;
    attendanceRecord.lateCount = counts.lateCount;
    attendanceRecord.halfDayCount = counts.halfDayCount;

    await attendanceRecord.save();

    res.status(200).json({
        success: true,
        message: "Attendance updated successfully",
        attendanceRecord,
    });
});
