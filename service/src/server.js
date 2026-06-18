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
import homeworkRoutes from "./routes/homework.route.js"

dotenv.config();

await databaseConnection();

const app = express();
app.use(cors(
  {
    origin: [
      "http://localhost:5173"
    ],
    credentials: true,
  }
));
app.use(cookies());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorMiddleware);