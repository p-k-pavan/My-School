import mongoose from "mongoose";

const FeeSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },

        feeStructureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FeeStructure",
            required: true,
        },

        academicYear: {
            type: String,
            required: true,
        },

        totalFee: {
            type: Number,
            required: true,
        },

        paidAmount: {
            type: Number,
            default: 0,
        },

        dueAmount: {
            type: Number,
            required: true,
        },

        discountAmount: {
            type: Number,
            default: 0,
        },

        dueDate: {
            type: Date,
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "partial",
                "paid",
                "overdue"
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export const Fee = mongoose.model("Fee", FeeSchema);