import express from "express";

import {
    createFee,
    generateFeesForClass,
    generateFeesForSchool,
    getAllFees,
    getFeeDashboard,
    getDefaulters,
    exportFeesToExcel,
    getFeeById,
    getFeeByStudent,
    getFeeByClass,
    updateFee,
    deleteFee,
} from "../controllers/fee.controller.js";

import { isAuthenticated } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware.js";

const router = express.Router();
router.use(isAuthenticated);


router.post(
    "/",
    authorizeRoles("management", "admin"),
    createFee
);

router.post(
    "/generate/class",
    authorizeRoles("management", "admin"),
    generateFeesForClass
);

router.post(
    "/generate/school",
    authorizeRoles("management", "admin"),
    generateFeesForSchool
);

router.get(
    "/",
    authorizeRoles("management", "admin"),
    getAllFees
);


router.get(
    "/dashboard",
    authorizeRoles("management", "admin"),
    getFeeDashboard
);

router.get(
    "/defaulters",
    authorizeRoles("management", "admin"),
    getDefaulters
);

router.get(
    "/export/excel",
    authorizeRoles("management", "admin"),
    exportFeesToExcel
);

router.get(
    "/student/:studentId",
    authorizeRoles("management", "admin", "parent", "student"),
    getFeeByStudent
);

router.get(
    "/class/:classId",
    authorizeRoles("management", "admin"),
    getFeeByClass
);

router.get(
    "/:id",
    authorizeRoles("management", "admin"),
    getFeeById
);

router.put(
    "/:id",
    authorizeRoles("management", "admin"),
    updateFee
);

router.delete(
    "/:id",
    authorizeRoles("management", "admin"),
    deleteFee
);

export default router;