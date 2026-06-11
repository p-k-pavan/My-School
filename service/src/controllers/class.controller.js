import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/AppError";

export const createClass = asyncHandler(async (req, res) => {
  const { className, section, classTeacher } = req.body;

  if (!className || !section) {
    throw new AppError(
      "Class name and section are required",
      400
    );
  }

  const existingClass = await Class.findOne({
    className,
    section,
  });

  if (existingClass) {
    throw new AppError(
      "Class already exists",
      409
    );
  }

  const newClass = await Class.create({
    className,
    section,
    classTeacher,
  });

  res.status(201).json({
    success: true,
    message: "Class created successfully",
    class: newClass,
  });
});