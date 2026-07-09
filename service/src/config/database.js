import mongoose from "mongoose";

export const databaseConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      maxPoolSize: 500, // Handle up to 500 concurrent connections in pool
      minPoolSize: 50,  // Keep at least 50 connections warm
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Database Connected");
  } catch (error) {
    console.error("Database Connection Error:", error.message);
    process.exit(1);
  }
};