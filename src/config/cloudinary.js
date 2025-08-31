import Product from "../models/Product.js";
import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = Router();
const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { name, slug, description, price, unit, quantity } = req.body;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: "Upload at least 1 product image" });
    }

    const images = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "greenvillage/products",
        });
        fs.unlinkSync(file.path);
        return { public_id: result.public_id, url: result.secure_url };
      })
    );

    const product = await Product.create({ name, slug, description, price, unit, quantity, images });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
