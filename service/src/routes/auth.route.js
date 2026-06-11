import express from "express";
import {
  changePassword,
  getCurrentUser,
  login,
  logout
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/TokenVerify.js";


const router = express.Router();

router.post("/login", login);
router.post("/logout", logout)
router.get("/me", isAuthenticated, getCurrentUser);
router.put("/change-password", isAuthenticated, changePassword);

export default router;