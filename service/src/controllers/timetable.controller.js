import mongoose from "mongoose";
import Timetable from "../models/timetable.model.js";
import { Class } from "../models/class.model.js";
import { Subject } from "../models/subject.model.js";
import { Teacher } from "../models/teacher.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";

const validatePeriods = async (periods, classId) => {
    const uniquePeriodNos = new Set();

    for (const period of periods) {
        const { periodNo, subjectId, teacherId, startTime, endTime } = period;

        if (periodNo === undefined || !subjectId || !teacherId || !startTime || !endTime) {
            throw new AppError("All period fields (periodNo, subjectId, teacherId, startTime, endTime) are required", 400);
        }

        if (uniquePeriodNos.has(periodNo)) {
            throw new AppError(`Duplicate period number ${periodNo} found in the list`, 400);
        }
        uniquePeriodNos.add(periodNo);

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            throw new AppError(`Invalid subject ID: ${subjectId}`, 400);
        }
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            throw new AppError(`Invalid teacher ID: ${teacherId}`, 400);
        }

        const subject = await Subject.findOne({ _id: subjectId });
        if (!subject) {
            throw new AppError(`Subject not found `, 404);
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            throw new AppError(`Teacher not found: ${teacherId}`, 404);
        }
    }
};

export const handleTimetableNotificationAsync = ( timetable, action, actorId ) => {
    setImmediate(async () => {
        try {
            const klass = await Class.findById(timetable.classId)
                .select("className section")
                .lean();

            if (!klass) {
                console.warn(`Class not found for timetable ${timetable._id}`);
                return;
            }

            const className = `${klass.className}-${klass.section}`;

            const notificationContent = {
                create: {
                    title: `New Timetable Published`,
                    description: `A new timetable has been published for Class ${className}. Please check the latest schedule.`,
                },

                update: {
                    title: `Timetable Updated`,
                    description: `The timetable for Class ${className} has been updated. Please check the latest schedule.`,
                },
            };

            const content = notificationContent[action];

            if (!content) return;

            const parentIds = await Student.distinct("parentId", {
                classId: timetable.classId,
                status: true,
            });

            const parentUserIds = await Parent.distinct("userId", {
                _id: { $in: parentIds },
                status: true,
            });

            const teacherIds = [
                ...new Set(
                    timetable.periods.map(period =>
                        period.teacherId.toString()
                    )
                ),
            ];

            const teacherUserIds = await Teacher.distinct("userId", {
                _id: { $in: teacherIds },
                status: true,
            });

            let userIds = [
                ...new Set([
                    ...parentUserIds.map(id => id.toString()),
                    ...teacherUserIds.map(id => id.toString()),
                ]),
            ];

            userIds = userIds.filter(
                id => id !== actorId.toString()
            );

            if (!userIds.length) {
                console.log( `No users found for timetable notification.` );
                return;
            }

            const notification = await Notification.create({
                title: content.title,
                description: content.description,
                type: "timetable",
                receiverType: "classes",
                targetClasses: [timetable.classId],
                entityId: timetable._id,
                createdBy: actorId,
            });

            sendPushNotificationsAsync({
                title: content.title,
                body: content.description,
                userIds,
                data: {
                    type: "timetable",
                    timetableId: timetable._id.toString(),
                    notificationId: notification._id.toString(),
                    action,
                },

                onSuccess: async () => {
                    await Notification.findByIdAndUpdate(
                        notification._id,{
                            isPushSent: true,
                        });
                },
            });

            console.log( `Timetable notification queued for ${userIds.length} users.` );

        } catch (error) {
            console.error( `Timetable notification failed`, error );
        }
    });
};

export const createTimetable = asyncHandler(async (req, res) => {
    const { classId, day, periods, academicYear, isActive } = req.body;

    if (!classId || !day || !periods || !Array.isArray(periods) || !academicYear) {
        throw new AppError("Class ID, day, periods array, and academic year are required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    const klass = await Class.findById(classId);
    if (!klass) {
        throw new AppError("Class not found", 404);
    }

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (!validDays.includes(day)) {
        throw new AppError("Day must be Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday", 400);
    }

    await validatePeriods(periods, classId);

    const existingTimetable = await Timetable.findOne({
        classId,
        day,
        academicYear: academicYear.trim(),
    });

    if (existingTimetable) {
        throw new AppError(`Timetable already exists for class on ${day} for academic year ${academicYear}`, 409);
    }

    const newTimetable = await Timetable.create({
        classId,
        day,
        periods,
        academicYear: academicYear.trim(),
        isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
        success: true,
        message: "Timetable slot created successfully",
        timetable: newTimetable,
    });
});


export const getTimetableByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { academicYear, day } = req.query;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new AppError("Invalid class ID", 400);
    }

    if (!academicYear) {
        throw new AppError("Academic year query parameter is required", 400);
    }

    const query = {
        classId,
        academicYear,
    };

    if (day) {
        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (!validDays.includes(day)) {
            throw new AppError("Invalid day filter value", 400);
        }
        query.day = day;
    }

    const timetable = await Timetable.find(query)
        .populate("periods.subjectId", "subjectName subjectCode")
        .populate("periods.teacherId", "teacherName email mobile")
        .sort({
            day: 1,
        });

    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    timetable.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));

    res.status(200).json({
        success: true,
        message: "Timetable fetched successfully",
        count: timetable.length,
        timetable,
    });
});


export const updateTimetable = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { day, periods, academicYear, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid timetable ID", 400);
    }

    const timetable = await Timetable.findById(id);
    if (!timetable) {
        throw new AppError("Timetable record not found", 404);
    }

    const finalDay = day || timetable.day;
    const finalAcademicYear = academicYear ? academicYear.trim() : timetable.academicYear;

    if (day || academicYear) {
        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (day && !validDays.includes(day)) {
            throw new AppError("Invalid day value", 400);
        }

        const duplicateTimetable = await Timetable.findOne({
            classId: timetable.classId,
            day: finalDay,
            academicYear: finalAcademicYear,
            _id: { $ne: id },
        });

        if (duplicateTimetable) {
            throw new AppError(`Timetable slot already exists for class on ${finalDay} for academic year ${finalAcademicYear}`, 409);
        }
    }

    if (periods) {
        if (!Array.isArray(periods)) {
            throw new AppError("periods must be an array", 400);
        }
        await validatePeriods(periods, timetable.classId);
        timetable.periods = periods;
    }

    timetable.day = finalDay;
    timetable.academicYear = finalAcademicYear;
    if (isActive !== undefined) {
        timetable.isActive = isActive;
    }

    await timetable.save();

    res.status(200).json({
        success: true,
        message: "Timetable updated successfully",
        timetable,
    });
});


export const deleteTimetable = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid timetable ID", 400);
    }

    const deletedTimetable = await Timetable.findByIdAndDelete(id);

    if (!deletedTimetable) {
        throw new AppError("Timetable record not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Timetable record deleted successfully",
    });
});

export const getSubjectsByClass = asyncHandler(async (req, res) => {

    const { classId } = req.params;

    const klass = await Class.findById(classId);

    if (!klass) {
        throw new AppError(
            "Class not found",
            404
        );
    }

    const subjects = await Timetable.aggregate([
        {
            $match: {
                classId: new mongoose.Types.ObjectId(classId),
                isActive: true,
            },
        },
        { $unwind: "$periods" },
        {
            $group: {
                _id: "$periods.subjectId",
            },
        },
        {
            $lookup: {
                from: "subjects",
                localField: "_id",
                foreignField: "_id",
                as: "subject",
            },
        },
        { $unwind: "$subject" },
        {
            $replaceRoot: {
                newRoot: "$subject",
            },
        },
        {
            $project: {
                subjectName: 1,
                subjectCode: 1,
            },
        },
        {
            $sort: {
                subjectName: 1,
            },
        },
    ]);

    return res.status(200).json({
        success: true,
        count: subjects.length,
        subjects,
    });

});

export const getTimetableByTeacher = asyncHandler(async (req, res) => {
    const { academicYear, day } = req.query;

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        throw new AppError("Invalid User Id", 400);
    }

    const teacher = await Teacher.findOne({
        userId: req.user.id,
    });

    if (!teacher) {
        throw new AppError("Teacher not found", 404);
    }

    if (!academicYear) {
        throw new AppError("Academic year query parameter is required", 400);
    }

    const query = {
        "periods.teacherId": teacher._id,
        academicYear,
    };

    if (day) {
        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (!validDays.includes(day)) {
            throw new AppError("Invalid day filter value", 400);
        }
        query.day = day;
    }

    const timetable = await Timetable.find(query)
        .populate("periods.subjectId", "subjectName subjectCode")
        .populate("classId", "className section")
        .sort({
            day: 1,
        });

    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    timetable.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));

    res.status(200).json({
        success: true,
        message: "Timetable fetched successfully",
        count: timetable.length,
        timetable,
    });
});
