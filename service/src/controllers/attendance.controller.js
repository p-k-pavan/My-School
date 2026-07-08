import mongoose from "mongoose";
import Attendance from "../models/attendance.model.js";
import { Class } from "../models/class.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Parent } from "../models/parent.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
import { sendPushNotificationsAsync } from "../utils/fcm.js";


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

export const handleAttendanceNotificationAsync = (attendanceRecord, classId) => {
    setImmediate(async () => {
        try {

            const klass = await Class.findById(classId)
                .select("className section")
                .lean();

            if (!klass) return;

            const className = `${klass.className}-${klass.section}`;

            const attendanceDate = new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }).format(new Date(attendanceRecord.attendanceDate));

            const teacherTitle = `Attendance Submitted (${className})`;

            const teacherDescription = `Attendance has been successfully submitted for ${className} on ${attendanceDate}.`;

            const teacherNotification =
                await Notification.create({
                    title: teacherTitle,
                    description: teacherDescription,
                    type: "attendance",
                    receiverType: "individual_users",
                    receiverIds: [attendanceRecord.markedBy],
                    entityId: attendanceRecord._id,
                    createdBy: attendanceRecord.markedBy,
                });

            const TeacherUserId = await Teacher.findOne({ _id: attendanceRecord.markedBy }).lean();

            sendPushNotificationsAsync({
                title: teacherTitle,
                body: teacherDescription,
                userIds: [TeacherUserId?.userId],
                data: {
                    type: "attendance",
                    attendanceId: attendanceRecord._id.toString(),
                    notificationId: teacherNotification._id.toString(),
                     action: "mark",
                },
            });

            const notifyList = attendanceRecord.attendance.filter(item =>
                ["A", "L", "HD"].includes(item.status)
            );

            if (!notifyList.length) return;

            const studentIds = notifyList.map(item => item.studentId);

            const students = await Student.find({ _id: { $in: studentIds } })
                .select("studentName parentId")
                .lean();

            const studentMap = new Map();

            students.forEach(student => {
                studentMap.set(student._id.toString(), student);
            });

            const parentIds = students.map(s => s.parentId);

            const parents = await Parent.find({ _id: { $in: parentIds }, status: true })
                .select("userId")
                .lean();

            const parentMap = new Map();

            parents.forEach(parent => {
                parentMap.set(parent._id.toString(), parent);
            });

            const notificationsToCreate = [];
            const pushNotificationsToSend = [];

            for (const item of notifyList) {
                const student = studentMap.get(item.studentId.toString());
                if (!student) continue;

                const parent = parentMap.get(student.parentId.toString());
                if (!parent) continue;

                let title = "";
                let description = "";

                switch (item.status) {
                    case "A":
                        title = "Student Absent";
                        description = `${student.studentName} has been marked absent on ${attendanceDate}.`;
                        break;
                    case "L":
                        title = "Student Late";
                        description = `${student.studentName} arrived late on ${attendanceDate}.`;
                        break;
                    case "HD":
                        title = "Half Day Attendance";
                        description = `${student.studentName} has been marked as Half Day on ${attendanceDate}.`;
                        break;
                }

                notificationsToCreate.push({
                    title,
                    description,
                    type: "attendance",
                    receiverType: "individual_users",
                    receiverIds: [parent.userId],
                    entityId: attendanceRecord._id,
                    createdBy: attendanceRecord.markedBy,
                });

                pushNotificationsToSend.push({
                    title,
                    description,
                    userId: parent.userId.toString(),
                    studentId: item.studentId.toString(),
                    status: item.status,
                });
            }

            if (notificationsToCreate.length > 0) {
                const createdNotifications = await Notification.insertMany(notificationsToCreate);

                pushNotificationsToSend.forEach((push, idx) => {
                    const notificationId = createdNotifications[idx]?._id?.toString() || "";
                    sendPushNotificationsAsync({
                        title: push.title,
                        body: push.description,
                        userIds: [push.userId],
                        data: {
                            type: "attendance",
                            attendanceId: attendanceRecord._id.toString(),
                            notificationId,
                            studentId: push.studentId,
                            status: push.status,
                            action: "mark",
                        },
                    });
                });
            }

            console.log(`Attendance notifications completed for ${notifyList.length} students.`);

        } catch (error) {
            console.error("Attendance notification failed", error);
        }
    });
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

    handleAttendanceNotificationAsync(attendanceRecord, classId);

    res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        attendanceRecord,
    });
});


export const getAttendanceByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { startDate, endDate, page = 1, limit = 31 } = req.query;

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
                        $project: {
                            _id: 1,
                            attendanceDate: 1,
                            status: "$attendance.status",
                            remarks: "$attendance.remarks"
                        },
                    }
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
