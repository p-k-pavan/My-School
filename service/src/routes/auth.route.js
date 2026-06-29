import express from "express";
import {
  changePassword,
  getCurrentUser,
  login,
  logout
} from "../controllers/auth.controller.js";
import {
  registerDeviceToken,
  deactivateDeviceToken
} from "../controllers/deviceToken.controller.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";


const router = express.Router();

router.post("/login", login);
router.post("/logout", logout)
router.get("/me", isAuthenticated, getCurrentUser);
router.put("/change-password", isAuthenticated, changePassword);
router.post("/device-token", isAuthenticated, registerDeviceToken);
router.post("/device-token/deactivate", isAuthenticated, deactivateDeviceToken);

export default router;