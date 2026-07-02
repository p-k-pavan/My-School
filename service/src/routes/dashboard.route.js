import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getDashboardOverview } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
    "/overview",
    isAuthenticated,
    authorizeRoles("admin", "management"),
    getDashboardOverview
);

export default router;
