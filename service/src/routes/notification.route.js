import express from "express";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";


const router = express.Router();

router.use(isAuthenticated);

router.post("/", authorizeRoles("management", "admin"), createNotification);

router.get("/", authorizeRoles("management", "admin"), getNotifications);

router.delete("/:notificationId",authorizeRoles("management", "admin"), deleteNotification);

export default router;