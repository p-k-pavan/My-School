import express from "express";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
    markAttendance,
    getAttendanceByStudent,
    getAttendanceByClass,
    getAttendanceSummary,
    updateAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("teacher", "admin", "management"),
    markAttendance
);

router.get(
    "/student/:studentId",
    authorizeRoles("teacher", "admin", "management", "parent"),
    getAttendanceByStudent
);

router.get(
    "/class/:classId",
    authorizeRoles("teacher", "admin", "management"),
    getAttendanceByClass
);

router.get(
    "/summary",
    authorizeRoles("teacher", "admin", "management", "parent"),
    getAttendanceSummary
);

router.put(
    "/:id",
    authorizeRoles("teacher", "admin", "management"),
    updateAttendance
);

export default router;
