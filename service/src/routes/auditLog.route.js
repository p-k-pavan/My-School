import express from "express";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getAuditLogById, getAuditLogs, downloadAuditLogs } from "../controllers/auditLog.controller.js";


const router = express.Router();

router.use(isAuthenticated);

router.get(
    "/",
    authorizeRoles("admin", "management"),
    getAuditLogs
);

router.get(
    "/download",
    authorizeRoles("admin", "management"),
    downloadAuditLogs
);

router.get(
    "/:id",
    authorizeRoles("admin", "management"),
    getAuditLogById
);

export default router;