import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { upload } from "../middleware/multer.js";
import { changeParentStatus, getAllParents, getParentById, getParentByUserId, updateParent } from "../controllers/parent.controller.js";


const router = express.Router();

router.get(
    "/",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getAllParents
);
router.get(
    "/:id",
    isAuthenticated,
    authorizeRoles("parent", "admin", "management"),
    getParentById
);

router.get(
    "/user/:userId",
    isAuthenticated,
    authorizeRoles("parent", "admin", "management"),
    getParentByUserId
)

router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    updateParent
);
router.put(
    "/:id/status",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    changeParentStatus
);

export default router;