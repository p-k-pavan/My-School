import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";
import { bulkUploadParents, changeParentStatus, createParent, getAllParents, getParentById, updateParent } from "../controllers/parent.controller.js";


const router = express.Router();

router.post(
    "/create",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    createParent
);
router.post(
    "/bulk-upload",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    upload.single("file"),
    bulkUploadParents
);

router.get(
    "/get",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getAllParents
);
router.get(
    "/get/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getParentById
);

router.put(
    "/update/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateParent
);
router.put(
    "/status/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    changeParentStatus
);



export default router;