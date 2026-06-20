import express from "express";

import {
    createFeeStructure,
    getAllFeeStructure,
    getFeeStructureById,
    updateFeeStructure,
    deleteFeeStructure,
} from "../controllers/feeStructure.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.post(
    "/",
    authorizeRoles("management"),
    createFeeStructure
);


router.get(
    "/",
    authorizeRoles("admin", "management"),
    getAllFeeStructure
);


router.get(
    "/:id",
    authorizeRoles("admin", "management"),
    getFeeStructureById
);


router.put(
    "/:id",
    authorizeRoles("management"),
    updateFeeStructure
);


router.delete(
    "/:id",
    authorizeRoles("management"),
    deleteFeeStructure
);

export default router;