import slugify from "slugify";
import { StatusCodes } from "http-status-codes";
import Category from "../models/Category.js";

export async function list(req, res) {
  const cats = await Category.find().sort({ createdAt: -1 });
  res.json(cats);
}

export async function create(req, res) {
  const { name } = req.body;
  if (!name) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Name is required" });
  const exists = await Category.findOne({ name });
  if (exists) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Category exists" });
  const slug = slugify(name, { lower: true, strict: true });
  const cat = await Category.create({ name, slug });
  res.status(StatusCodes.CREATED).json(cat);
}

export async function remove(req, res) {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.json({ ok: true });
}