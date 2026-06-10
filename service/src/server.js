import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors(
  {
    origin: [
      "http://localhost:3000"
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});