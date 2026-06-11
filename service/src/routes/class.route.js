import express from "express";

import { isAuthenticated } from "../middleware/TokenVerify.js";
import { createClass } from "../controllers/class.controller.js";


const router = express.Router();

router.post("/create", isAuthenticated, createClass);


export default router;