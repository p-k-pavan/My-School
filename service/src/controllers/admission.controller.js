import XLSX from "xlsx"
import asyncHandler from "../middleware/asyncHandler.js";
import { Class } from "../models/class.model.js";
import { Parent } from "../models/parent.model.js";
import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { generatePassword } from "../utils/genaratePassword.js";

export const createAdmission = asyncHandler(
    async (req, res) => {
        const {
            admissionNo,
            studentName,
            profilePhoto,
            classId,
            section,
            rollNo,
            dob,
            gender,
            bloodGroup,
            aadhaarNumber,
            academicYear,

            fatherName,
            motherName,
            fatherOccupation,
            motherOccupation,

            phoneNumber,
            alternatePhoneNumber,
            email,

            guardianName,
            guardianRelation,

            annualIncome,
            state,
            city,
            pincode,
            address,

            joiningDate,
        } = req.body;

        if (
            !admissionNo ||
            !studentName ||
            !classId ||
            !dob ||
            !gender ||
            !phoneNumber ||
            !email ||
            !fatherName ||
            !motherName ||
            !academicYear
        ) {
            throw new AppError(
                "Required fields are missing",
                400
            );
        }

        const existingStudent =
            await Student.findOne({
                admissionNo,
            });

        if (existingStudent) {
            throw new AppError(
                "Admission number already exists",
                409
            );
        }

        const existingAadhaar =
            aadhaarNumber
                ? await Student.findOne({
                      aadhaarNumber,
                  })
                : null;

        if (existingAadhaar) {
            throw new AppError(
                "Aadhaar number already exists",
                409
            );
        }

        const klass =
            await Class.findById(
                classId
            );

        if (!klass) {
            throw new AppError(
                "Class not found",
                404
            );
        }

        let parent = await Parent.findOne({
            $or: [
                { phoneNumber },
                { email },
            ],
        });

        let user = null;
        let createdUser = false;
        let createdParent = false;

        try {
            if (!parent) {
                user =
                    await User.findOne({
                        $or: [
                            {
                                mobile:
                                    phoneNumber,
                            },
                            { email },
                        ],
                    });

                if (!user) {
                    const password =
                        await generatePassword(
                            motherName,
                            phoneNumber
                        );

                    user =
                        await User.create({
                            name: motherName,
                            email,
                            mobile:phoneNumber,
                            role: "parent",
                            password,
                            isPasswordChanged: false,
                        });

                    createdUser = true;
                }

                parent =
                    await Parent.create({
                        userId: user._id,
                        email,

                        fatherName,
                        motherName,

                        fatherOccupation,
                        motherOccupation,

                        phoneNumber,
                        alternatePhoneNumber,

                        guardianName,
                        guardianRelation,

                        annualIncome,

                        state,
                        city,
                        pincode,
                        address,
                    });

                createdParent = true;
            }

            const student =
                await Student.create({
                    admissionNo,
                    studentName,
                    profilePhoto,

                    classId,

                    dob,
                    gender,
                    bloodGroup,

                    aadhaarNumber,
                    academicYear,

                    parentId:parent._id,

                    joiningDate,
                });

            parent.studentIds.push(student._id);

            await parent.save();

            const populatedStudent =
                await Student.findById(
                    student._id
                )
                    .populate(
                        "classId",
                        "className section"
                    )
                    .populate(
                        "parentId",
                        "fatherName motherName phoneNumber email"
                    );

            res.status(201).json({
                success: true,
                message: "Admission completed successfully",
                student: populatedStudent,
            });
        } catch (error) {
            if (createdParent) {
                await Parent.findByIdAndDelete(parent._id);
            }

            if ( createdUser && user ) {
                await User.findByIdAndDelete(user._id);
            }

            throw error;
        }
    }
);

export const bulkUploadAdmissions =
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError(
        "Excel file is required",
        400
      );
    }

    const errors = [];
    let successCount = 0;

    try {
      const workbook =
        XLSX.readFile(
          req.file.path
        );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[
          sheetName
        ];

      const data =
        XLSX.utils.sheet_to_json(
          worksheet
        );

      for (const [
        index,
        row,
      ] of data.entries()) {
        try {
          const {
            admissionNo,
            studentName,
            classId,
            section,
            rollNo,
            dob,
            gender,
            bloodGroup,
            aadhaarNumber,
            academicYear,

            fatherName,
            motherName,
            fatherOccupation,
            motherOccupation,

            phoneNumber,
            alternatePhoneNumber,
            email,

            guardianName,
            guardianRelation,

            annualIncome,
            state,
            city,
            pincode,
            address,

            joiningDate,
          } = row;

          if (
            !admissionNo ||
            !studentName ||
            !classId ||
            !rollNo ||
            !dob ||
            !gender ||
            !phoneNumber ||
            !email
          ) {
            errors.push({
              row: index + 2,
              error:
                "Required fields are missing",
            });
            continue;
          }

          const existingStudent =
            await Student.findOne({
              admissionNo,
            });

          if (
            existingStudent
          ) {
            errors.push({
              row: index + 2,
              admissionNo,
              error:
                "Admission number already exists",
            });

            continue;
          }

          const klass =
            await Class.findById(
              classId
            );

          if (!klass) {
            errors.push({
              row: index + 2,
              admissionNo,
              error:
                "Class not found",
            });

            continue;
          }

          const existingRoll =
            await Student.findOne(
              {
                classId,
                section,
                rollNo,
              }
            );

          if (
            existingRoll
          ) {
            errors.push({
              row: index + 2,
              admissionNo,
              error:
                "Roll number already exists",
            });

            continue;
          }

          let parent =
            await Parent.findOne(
              {
                $or: [
                  {
                    phoneNumber,
                  },
                  {
                    email,
                  },
                ],
              }
            );

          let user =
            null;

          if (!parent) {
            user =
              await User.findOne(
                {
                  $or: [
                    {
                      mobile:
                        phoneNumber,
                    },
                    {
                      email,
                    },
                  ],
                }
              );

            if (!user) {
              const password =
                await generatePassword(
                  motherName,
                  phoneNumber
                );

              user =
                await User.create({
                  name: motherName,
                  email,
                  mobile:
                    phoneNumber,
                  role: "parent",
                  password,
                  isPasswordChanged:
                    false,
                });
            }

            parent =
              await Parent.create(
                {
                  userId:
                    user._id,
                  email,

                  fatherName,
                  motherName,

                  fatherOccupation,
                  motherOccupation,

                  phoneNumber,
                  alternatePhoneNumber,

                  guardianName,
                  guardianRelation,

                  annualIncome,

                  state,
                  city,
                  pincode,
                  address,
                }
              );
          }

          const student =
            await Student.create({
              admissionNo,
              studentName,

              classId,
              section,
              rollNo,

              dob,
              gender,
              bloodGroup,

              aadhaarNumber,
              academicYear,

              parentId:
                parent._id,

              joiningDate,
            });

          parent.studentIds.push(
            student._id
          );

          await parent.save();

          successCount++;
        } catch (
          error
        ) {
          errors.push({
            row: index + 2,
            error:
              error.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        message:
          "Admissions uploaded successfully",
        totalRecords:
          data.length,
        successCount,
        failedCount:
          errors.length,
        errors,
      });
    } finally {
      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }
    }
  });