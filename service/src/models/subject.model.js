import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        subjectCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

subjectSchema.index(
    { subjectCode: 1 },
    { unique: true }
);

export default mongoose.model("Subject", subjectSchema);