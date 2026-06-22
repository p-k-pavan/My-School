import express from "express";

import {
    createFeeStructure,
    getAllFeeStructure,
    getFeeStructureByYearAndClass,
    getFeeStructureById,
    updateFeeStructure,
    deleteFeeStructure,
} from "../controllers/FeeStructure.controller.js";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();
router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("management", "admin"),
    createFeeStructure
);

router.get(
    "/",
    authorizeRoles("management", "admin"),
    getAllFeeStructure
);

router.get(
    "/lookup",
    authorizeRoles("management", "admin"),
    getFeeStructureByYearAndClass
);

router.get(
    "/:id",
    authorizeRoles("management", "admin"),
    getFeeStructureById
);

router.put(
    "/:id",
    authorizeRoles("management", "admin"),
    updateFeeStructure
);

router.delete(
    "/:id",
    authorizeRoles("management", "admin"),
    deleteFeeStructure
);

export default router;