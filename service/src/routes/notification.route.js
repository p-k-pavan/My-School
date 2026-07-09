import express from "express";
import {
  createNotification,
  getNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";
import { authorizeRoles } from "../middleware/role.middleware.js";


const router = express.Router();

router.use(isAuthenticated);

router.post("/", authorizeRoles("management", "admin"), createNotification);

router.get("/", authorizeRoles("management", "admin"), getNotifications);

router.delete("/:notificationId",authorizeRoles("management", "admin"), deleteNotification);

export default router;