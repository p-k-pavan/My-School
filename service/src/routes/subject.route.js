import express from "express";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
} from "../controllers/subject.controller.js";

const router = express.Router();

router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("admin", "management"),
    createSubject
);

router.get(
    "/",
    authorizeRoles("teacher", "admin", "management", "parent"),
    getSubjects
);

router.get(
    "/:id",
    authorizeRoles("teacher", "admin", "management", "parent"),
    getSubjectById
);

router.put(
    "/:id",
    authorizeRoles("admin", "management"),
    updateSubject
);

router.delete(
    "/:id",
    authorizeRoles("admin", "management"),
    deleteSubject
);

export default router;
