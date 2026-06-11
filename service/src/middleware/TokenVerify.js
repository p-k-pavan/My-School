import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import AppError from "../utils/AppError.js";

export const isAuthenticated = asyncHandler(
  async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      throw new AppError("Please login first", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  }
);