import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const upload = multer({ dest: "uploads/" }); // Temporary local folder

// Upload route
router.post("/upload", upload.array("images", 5), async (req, res) => {
  try {
    const files = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "greenvillage/products",
        });
        fs.unlinkSync(file.path); // Delete local file after upload
        return { public_id: result.public_id, url: result.secure_url };
      })
    );
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router; // ✅ Add this default export
