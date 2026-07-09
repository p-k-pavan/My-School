import express from "express";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
    createTimetable,
    getTimetableByClass,
    updateTimetable,
    deleteTimetable,
    getTimetableByTeacher,
} from "../controllers/timetable.controller.js";

const router = express.Router();

router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("admin", "management"),
    createTimetable
);

router.get(
    "/teacher",
    authorizeRoles("teacher", "admin", "management"),
    getTimetableByTeacher
)

router.get(
    "/class/:classId",
    authorizeRoles("teacher", "admin", "management", "parent"),
    getTimetableByClass
);

router.put(
    "/:id",
    authorizeRoles("admin", "management"),
    updateTimetable
);

router.delete(
    "/:id",
    authorizeRoles("admin", "management"),
    deleteTimetable
);

export default router;
