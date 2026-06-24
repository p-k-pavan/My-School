import express from "express";

import {
    createHomework,
    updateHomework,
    deleteHomework,
    getHomeworkById,
    getHomeworkByClass,
    getStudentHomework,
    getHomeworkByTeacher,
} from "../controllers/homework.controller.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";


const router = express.Router();

router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("teacher", "admin", "management"),
    upload.array("attachments", 5),
    createHomework
);

router.put(
    "/",
    authorizeRoles("teacher", "admin", "management"),
    upload.array("attachments", 5),
    updateHomework
);

router.delete(
    "/:id",
    authorizeRoles("teacher", "admin", "management"),
    deleteHomework
);

router.get(
    "/teacher",
    authorizeRoles("teacher", "admin", "management"),
    getHomeworkByTeacher
);


router.get(
    "/:id",
    getHomeworkById
);


router.get(
    "/class/:id",
    authorizeRoles("admin", "management", "teacher", "parent"),
    getHomeworkByClass
);


router.get(
    "/student/:studentId",
    authorizeRoles("student", "parent", "admin", "management"),
    getStudentHomework
);

export default router;