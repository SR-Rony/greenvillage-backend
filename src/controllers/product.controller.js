import slugify from "slugify";
import { StatusCodes } from "http-status-codes";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { createProductSchema } from "../validators/product.schemas.js";

export async function list(req, res) {
  const { q, category } = req.query;
  const filter = { isActive: true };
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }
  const products = await Product.find(filter).populate("category", "name slug").sort({ createdAt: -1 });
  res.json(products);
}

export async function getOne(req, res) {
  const p = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
  if (!p) return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
  res.json(p);
}

export async function create(req, res) {
  try {
    const parsed = createProductSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined
    });
    const slug = slugify(parsed.slug || parsed.name, { lower: true, strict: true });
    const exists = await Product.findOne({ slug });
    if (exists) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Slug exists" });
    const product = await Product.create({ ...parsed, slug });
    res.status(StatusCodes.CREATED).json(product);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: err.errors.map(e => e.message).join(", ") });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
}

export async function update(req, res) {
  const { id } = req.params;
  const updates = req.body;
  if (updates.slug) {
    updates.slug = slugify(updates.slug, { lower: true, strict: true });
  }
  const product = await Product.findByIdAndUpdate(id, updates, { new: true });
  res.json(product);
}

export async function remove(req, res) {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.json({ ok: true });
}