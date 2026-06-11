import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { bulkUploadTeacher, createTeacher, deleteTeacher, getAllTeachers, getTeacherById, updateTeacher } from "../controllers/teacher.controller.js";


const router = express.Router();

router.post(
    "/create",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    createTeacher
);
router.post(
    "/bulk-upload",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    upload.single("file"),
    bulkUploadTeacher
);

router.get(
    "/get",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getAllTeachers
);
router.get(
    "/get/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getTeacherById
);

router.put(
    "/update/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateTeacher
);
router.delete(
    "/delete/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    deleteTeacher
);



export default router;