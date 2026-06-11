import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
      trim: true,
    },

    alternatePhoneNumber: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    emergencyContact: {
      type: String,
      trim: true,
    },

    relationWithStudent: {
      type: String,
      enum: ["Father", "Mother", "Guardian"],
      default: "Father",
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

parentSchema.index({ userId: 1 }, { unique: true });

export const Parent = mongoose.model("Parent", parentSchema);