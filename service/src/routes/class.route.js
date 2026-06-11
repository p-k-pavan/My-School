import express from "express";

import { bulkUploadClasses, createClass, getAllClasses, getClassById, updateClass } from "../controllers/class.controller.js";

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

router.get(
    "/get",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getAllClasses
);
router.get(
    "/get/:id",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getClassById
);

router.put(
    "/update/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateClass
);
router.delete(
    "/delete/:id",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getClassById
);



export default router;