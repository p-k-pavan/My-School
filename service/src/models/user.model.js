import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["parent", "teacher", "admin", "management"],
      default: "parent",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isPasswordChanged: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.index({ phoneNumber: 1 }, { unique: true });

userSchema.index({ role: 1 });

export const User = mongoose.model("User", userSchema);