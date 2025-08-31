import Product from "../models/Product.js";
import Category from "../models/Category.js";
import slugify from "slugify";

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
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "category",
      "name slug"
    );
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

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
    const { name, slug, description, price, unit, quantity, images, category } = req.body;

    if (!images || !images.length)
      return res.status(400).json({ success: false, message: "Upload at least 1 product image" });

    const product = await Product.create({
      name,
      slug: slugify(slug || name, { lower: true, strict: true }),
      description,
      price,
      unit,
      quantity,
      images,
      category,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update a product
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.slug) updates.slug = slugify(updates.slug, { lower: true, strict: true });

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

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
