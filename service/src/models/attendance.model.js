import mongoose from "mongoose";

const attendanceEntrySchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        status: {
            type: String,
            enum: ["P", "A", "L", "HD","H"],
            required: true,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        _id: false,
    }
);

const attendanceSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index: true,
        },

        attendanceDate: {
            type: Date,
            required: true,
            index: true,
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        attendance: [attendanceEntrySchema],

        totalStudents: {
            type: Number,
            default: 0,
        },

        presentCount: {
            type: Number,
            default: 0,
        },

        absentCount: {
            type: Number,
            default: 0,
        },

        lateCount: {
            type: Number,
            default: 0,
        },

        halfDayCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

attendanceSchema.index(
    { classId: 1, attendanceDate: 1 },
    { unique: true }
);

attendanceSchema.index(
    { "attendance.studentId": 1, attendanceDate: -1 }
);

export default mongoose.model("Attendance", attendanceSchema);