import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
    {
        academicYear: {
            type: String,
            required: true,
        },

        classLevel: {
            type: Number,
            required: true,
            index: true,
            min: 1,
            max: 10
        },

        tuitionFee: {
            type: Number,
            default: 0,
        },

        transportFee: {
            type: Number,
            default: 0,
        },

        examFee: {
            type: Number,
            default: 0,
        },

        libraryFee: {
            type: Number,
            default: 0,
        },

        miscellaneousFee: {
            type: Number,
            default: 0,
        },

        otherFee: {
            type: Number,
            default: 0,
        },

        totalFee: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

feeStructureSchema.index(
    {
        classLevel: 1,
        academicYear: 1,
    },
    {
        unique: true,
    }
);

export const FeeStructure = mongoose.model( "FeeStructure", feeStructureSchema );