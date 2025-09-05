import Product from "../models/Product.js";
import Category from "../models/Category.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/**
 * List all active products
 */
export const list = async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = { isActive: true };

    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get single product by slug
 */
export const getOne = async (req, res) => {
  try {

    // Use _id instead of id
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Create a new product
 */

export const create = async (req, res) => {
  try {
    const { name, price, unit, quantity, description, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Upload at least 1 image" });
    }

    // Upload files to Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
        resource_type: "image",
      });
      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });

      // Delete local file after upload
      fs.unlinkSync(file.path);
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Create product
    const product = await Product.create({
      name,
      slug,
      price,
      unit,
      quantity,
      description,
      category,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



/**
 * Update a product
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(req.body);
    

    // ✅ Auto-generate slug from name
    if (updates.name) {
      updates.slug = slugify(updates.name, { lower: true, strict: true });
    }

    // ✅ Fix category reference
    if (updates.category && updates.category._id) {
      updates.category = updates.category._id;
    }

    // ✅ Update product
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Delete a product
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
