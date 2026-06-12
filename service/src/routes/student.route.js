

import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";
import {  changeStudentStatus, getAllStudents, getStudentById, getStudentsByClass, getStudentsByParent, updateStudent } from "../controllers/student.controller.js";


const router = express.Router();

router.get(
    "/get",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getAllStudents
);
router.get(
    "/get/:id",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getStudentById
);

router.get(
    "/class/:classId",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getStudentsByClass
);

router.get(
    "/parent/:parentId",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getStudentsByParent
);

router.put(
    "/update/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateStudent
);
router.put(
    "/status/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    changeStudentStatus
);

export default router;