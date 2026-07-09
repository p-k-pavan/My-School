import express from "express";
import {
  changePassword,
  getCurrentUser,
  login,
  logout,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword
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

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);

export default router;