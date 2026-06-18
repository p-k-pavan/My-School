import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index: true,
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
            index: true,
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: {
                    type: String,
                    enum: ["pdf", "image", "doc", "video", "other"],
                },
            },
        ],

        assignedDate: {
            type: Date,
            default: Date.now,
        },

        dueDate: {
            type: Date,
            required: true,
            index: true,
        },

    },
    {
        timestamps: true,
    }
);

homeworkSchema.index({
    classId: 1,
    assignedDate: -1,
});

export const Homework = mongoose.model("Homework", homeworkSchema);