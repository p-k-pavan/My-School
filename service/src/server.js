import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import dotenv from "dotenv";

import { databaseConnection } from "./config/database.js";
import errorMiddleware from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.route.js";
import classRoutes from "./routes/class.route.js"
import teacherRoutes from "./routes/teacher.route.js"
import studentRoutes from "./routes/student.route.js"
import parentRoutes from "./routes/parent.route.js"
import admissionRoutes from "./routes/admission.route.js"
import attendanceRoutes from "./routes/attendance.route.js";
import subjectRoutes from "./routes/subject.route.js";
import timetableRoutes from "./routes/timetable.route.js";
import homeworkRoutes from "./routes/homework.route.js";
import feestructureRoutes from "./routes/feeStructure.route.js";
import feesRoutes from "./routes/fee.route.js";
import paymentRoutes from "./routes/payment.route.js";
import feedRoutes from "./routes/feed.route.js";

dotenv.config();

await databaseConnection();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8081",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
                      /^http:\/\/10\.0\.2\.2(:\d+)?$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));
app.use(cookies());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/class", classRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/feestructure", feestructureRoutes);
app.use("/api/fee", feesRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/feed", feedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(errorMiddleware);