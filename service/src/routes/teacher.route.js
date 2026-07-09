import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { assignClassesToTeacher, bulkUploadTeacher, changeTeacherStatus, createTeacher, getAllTeachers, getTeacherById, getTeacherByUserId, getTeacherClasses, removeClassFromTeacher, updateTeacher } from "../controllers/teacher.controller.js";
import { upload } from "../middleware/multer.js";


const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    createTeacher
);

router.post(
    "/upload",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    upload.single("file"),
    bulkUploadTeacher
);

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getAllTeachers
);

router.get(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getTeacherById
);

router.get(
    "/user/:userId",
    isAuthenticated,
    authorizeRoles("admin", "management", "teacher"),
    getTeacherByUserId
);

router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateTeacher
);

router.put(
    "/:id/status",
    isAuthenticated,
    authorizeRoles(
        "admin",
        "management"
    ),
    changeTeacherStatus
);

router.put(
    "/:id/assign-classes",
    isAuthenticated,
    authorizeRoles(
        "admin",
        "management"
    ),
    assignClassesToTeacher
);

router.put(
    "/:id/remove-class/:classId",
    isAuthenticated,
    authorizeRoles(
        "admin",
        "management"
    ),
    removeClassFromTeacher
);

router.get(
    "/:id/classes",
    isAuthenticated,
    authorizeRoles("admin", "management", "teacher"),
    getTeacherClasses
);

export default router;