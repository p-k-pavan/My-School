import express from "express";

import { bulkUploadClasses, createClass, deleteClass, getAllClasses, getClassById, updateClass } from "../controllers/class.controller.js";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";


const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    createClass
);

router.post(
    "/upload",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    upload.single("file"),
    bulkUploadClasses
);

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getAllClasses
);

router.get(
    "/:id",
    isAuthenticated,
    authorizeRoles("teacher", "admin", "management"),
    getClassById
);

router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateClass
);

router.delete(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    deleteClass
);



export default router;