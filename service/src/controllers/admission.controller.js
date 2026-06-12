import asyncHandler from "../middleware/asyncHandler";

export const createAdmission = asyncHandler(async (req, res) => {
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
        fatherName,
    motherName,
    fatherOccupation,
    motherOccupation,
    phoneNumber,
    alternatePhoneNumber,
    address,
    email,
    joiningDate,
    } = req.body;

    if (
        !employeeId ||
        !teacherName ||
        !mobile ||
        !email ||
        !qualification ||
        !joiningDate
    ) {
        throw new AppError(
            "All fields are required",
            400
        );
    }

    const existingTeacher = await Teacher.findOne({
        $or: [
            { employeeId },
            { email },
            { mobile },
        ],
    });

    if (existingTeacher) {
        throw new AppError(
            "Teacher already exists",
            409
        );
    }

    const existingUser = await User.findOne({
        $or: [
            { email },
            { mobile },
        ],
    });

    if (existingUser) {
        throw new AppError(
            "User already exists with this email or mobile",
            409
        );
    }

    let newUser = null;

    try {
        const password =
            await generatePassword(
                teacherName,
                mobile
            );

        newUser = await User.create({
            name: teacherName,
            email,
            mobile,
            role: "teacher",
            password,
            isPasswordChanged: false,
        });

        const newTeacher =
            await Teacher.create({
                userId: newUser._id,
                employeeId,
                teacherName,
                email,
                mobile,
                qualification,
                joiningDate,
                assignedClasses:
                    assignedClasses || [],
            });

        res.status(201).json({
            success: true,
            message:
                "Teacher created successfully",
            teacher: newTeacher,
        });
    } catch (error) {
        if (newUser) {
            await User.findByIdAndDelete(
                newUser._id
            );
        }

        throw error;
    }
});