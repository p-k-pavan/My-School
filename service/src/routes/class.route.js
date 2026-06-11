import express from "express";

import { bulkUploadClasses, createClass } from "../controllers/class.controller.js";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";


const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin", "management"),
  createClass
);
router.post(
  "/bulk-upload",
  isAuthenticated,
  authorizeRoles("admin", "management"),
  upload.single("file"),
  bulkUploadClasses
);



export default router;