import express from "express";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { bulkUploadAdmissions, createAdmission } from "../controllers/admission.controller.js";
import { upload } from "../middleware/multer.js";

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