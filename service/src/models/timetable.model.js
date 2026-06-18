import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
    {
        periodNo: {
            type: Number,
            required: true,
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        startTime: {
            type: String,
            required: true,
        },

        endTime: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const timetableSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index: true,
        },

        day: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
            required: true,
            index: true,
        },

        periods: [periodSchema],

        academicYear: {
            type: String,
            required: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

timetableSchema.index(
    {
        classId: 1,
        day: 1,
        academicYear: 1,
    },
    {
        unique: true,
    }
);

export default mongoose.model("Timetable", timetableSchema);