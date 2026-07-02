import asyncHandler from "../middleware/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Class } from "../models/class.model.js";
import { Parent } from "../models/parent.model.js";
import { Fee } from "../models/Fee.model.js";
import { FeeTransaction } from "../models/payment.model.js";
import Attendance from "../models/attendance.model.js";
import { FeedPost } from "../models/Feed.model.js";


export const getDashboardOverview = asyncHandler(async (req, res) => {

    const [ totalStudents, activeStudents, totalTeachers, activeTeachers, totalClasses, totalParents ] = await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: true }),
        Teacher.countDocuments(),
        Teacher.countDocuments({ status: true }),
        Class.countDocuments(),
        Parent.countDocuments({ status: true }),
    ]);

    const paymentAggregate = await FeeTransaction.aggregate([
        { $match: { paymentStatus: "success" } },
        { $group: { _id: null, totalCollected: { $sum: "$amount" } } }
    ]);
    const totalCollected = paymentAggregate.length > 0 ? paymentAggregate[0].totalCollected : 0;

    const feeAggregate = await Fee.aggregate([
        {
            $group: {
                _id: null,
                totalExpected: { $sum: "$totalFee" },
                totalPaid: { $sum: "$paidAmount" },
                totalDue: { $sum: "$dueAmount" }
            }
        }
    ]);
    const totalExpected = feeAggregate.length > 0 ? feeAggregate[0].totalExpected : 0;
    const totalPaid = feeAggregate.length > 0 ? feeAggregate[0].totalPaid : 0;
    const totalDue = feeAggregate.length > 0 ? feeAggregate[0].totalDue : 0;

    const methodBreakdown = await FeeTransaction.aggregate([
        { $match: { paymentStatus: "success" } },
        {
            $group: {
                _id: "$paymentMethod",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    const collectedByMethod = {
        cash: 0,
        upi: 0,
        card: 0,
        bank_transfer: 0,
        cheque: 0
    };
    methodBreakdown.forEach(item => {
        if (item._id in collectedByMethod) {
            collectedByMethod[item._id] = item.total;
        }
    });

    const latestAttendance = await Attendance.findOne().sort({ attendanceDate: -1 });
    let attendanceStats = {
        totalStudents: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        halfDayCount: 0,
        attendanceRate: 0,
        date: null
    };

    if (latestAttendance) {
        const { totalStudents, presentCount, absentCount, lateCount, halfDayCount, attendanceDate } = latestAttendance;
        const presentAndLateAndHalf = presentCount + lateCount + halfDayCount;
        const rate = totalStudents > 0 ? Math.round((presentAndLateAndHalf / totalStudents) * 100) : 0;

        attendanceStats = {
            totalStudents,
            presentCount,
            absentCount,
            lateCount,
            halfDayCount,
            attendanceRate: rate,
            date: attendanceDate
        };
    }

    const recentAdmissions = await Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("classId", "className section")
        .select("studentName admissionNo joiningDate gender profilePhoto classId");

    const recentPayments = await FeeTransaction.find({ paymentStatus: "success" })
        .sort({ paymentDate: -1 })
        .limit(5)
        .populate({
            path: "studentId",
            select: "studentName profilePhoto classId",
            populate: {
                path: "classId",
                select: "className section"
            }
        })
        .populate("collectedBy", "name");

    const recentFeed = await FeedPost.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "name")
        .select("title description createdAt attachments");

    const classes = await Class.find().sort({ className: 1, section: 1 });
    const classWiseDistribution = await Promise.all(
        classes.map(async (cls) => {
            const count = await Student.countDocuments({ classId: cls._id, status: true });
            return {
                classId: cls._id,
                className: cls.className,
                section: cls.section,
                studentCount: count
            };
        })
    );

    res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: {
            counts: {
                totalStudents,
                activeStudents,
                totalTeachers,
                activeTeachers,
                totalClasses,
                totalParents
            },
            feesOverview: {
                totalCollected,
                totalExpected,
                totalPaid,
                totalDue,
                collectedByMethod
            },
            attendanceToday: attendanceStats,
            recentAdmissions,
            recentPayments,
            recentFeed,
            classWiseDistribution
        }
    });
});
