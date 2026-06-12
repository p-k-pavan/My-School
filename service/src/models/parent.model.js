import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        fatherName: {
            type: String,
            required: true,
            trim: true,
        },

        motherName: {
            type: String,
            required: true,
            trim: true,
        },

        fatherOccupation: {
            type: String,
            trim: true,
        },

        motherOccupation: {
            type: String,
            trim: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        alternatePhoneNumber: {
            type: String,
            trim: true,
        },

        guardianName: {
            type: String,
            trim: true,
            default: ""
        },

        guardianRelation: {
            type: String,
            trim: true,
            default: ""
        },

        annualIncome: {
            type: Number,
            required: true,
            min: 0,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        studentIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
            },
        ],

        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Parent = mongoose.model("Parent", parentSchema);