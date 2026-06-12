import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";
import { changeParentStatus, getAllParents, getParentById, updateParent } from "../controllers/parent.controller.js";


const router = express.Router();

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