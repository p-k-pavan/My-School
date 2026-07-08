import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY || process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = "my-school") => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(err => console.error("Cloudinary unlink failed:", err));
    }
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(err => console.error("Cloudinary unlink failed:", err));
    }
    throw error;
  }
};


export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return response;
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return null;
  }
};
