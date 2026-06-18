import mongoose from "mongoose";

const feeTransactionSchema = new mongoose.Schema(
    {
        studentFeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudentFee",
            required: true,
            index: true,
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },

        receiptNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 1,
        },

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "upi",
                "card",
                "bank_transfer",
                "cheque",
            ],
            required: true,
        },

        transactionId: {
            type: String,
            default: null,
            trim: true,
        },

        paymentStatus: {
            type: String,
            enum: ["success", "pending", "failed"],
            default: "success",
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        paymentDate: {
            type: Date,
            default: Date.now,
            index: true,
        },

        collectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

feeTransactionSchema.index({ studentId: 1, paymentDate: -1 });

export const FeeTransaction = mongoose.model("FeeTransaction", feeTransactionSchema);