import express from "express";
import { authorizeRoles } from "../middleware/role.middleware";
import { isAuthenticated } from "../middleware/TokenVerify";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  authorizeRoles( "admin", "management" ),
  createAdmission
);

router.post(
  "/upload",
  isAuthenticated,
  authorizeRoles( "admin", "management" ),
  upload.single("file"),
  bulkUploadAdmissions
);

export default router;