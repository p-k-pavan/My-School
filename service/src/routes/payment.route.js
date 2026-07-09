import express from "express";

import {
    createFeePayment,
    getAllFeePayments,
    exportPaymentsToExcel,
    getFeePaymentByStudentId,
    getFeePaymentById,
    downloadFeeReceipt,
    voidFeePayment,
} from "../controllers/payment.controller.js";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();
router.use(isAuthenticated);


router.post(
    "/",
    authorizeRoles("management", "admin"),
    createFeePayment
);

router.get(
    "/",
    authorizeRoles("management", "admin"),
    getAllFeePayments
);

router.get(
    "/export/excel",
    authorizeRoles("management", "admin"),
    exportPaymentsToExcel
);

router.get(
    "/student/:studentId",
    authorizeRoles("management", "admin"),
    getFeePaymentByStudentId
);

router.get(
    "/:id",
    authorizeRoles("management", "admin"),
    getFeePaymentById
);

router.get(
    "/:id/receipt",
    authorizeRoles("management", "admin"),
    downloadFeeReceipt
);

router.patch(
    "/:id/void",
    authorizeRoles("management", "admin"),
    voidFeePayment
);

export default router;