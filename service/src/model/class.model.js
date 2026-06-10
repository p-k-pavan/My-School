import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
   className,

  section,

  classTeacher
  },
  {
    timestamps: true,
  }
);

export const Class = mongoose.model("Class", classSchema);