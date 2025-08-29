import { StatusCodes } from "http-status-codes";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function create(req, res) {
  const { items, shippingAddress, paymentMethod = "cod" } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "No items" });
  }
  // Map product info and compute totals
  let subtotal = 0;
  const lineItems = [];
  for (const it of items) {
    const p = await Product.findById(it.productId);
    if (!p) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product" });
    if (p.quantity < it.quantity) return res.status(StatusCodes.BAD_REQUEST).json({ message: `Insufficient stock for ${p.name}` });
    subtotal += p.price * it.quantity;
    lineItems.push({ product: p._id, name: p.name, price: p.price, quantity: it.quantity });
    p.quantity -= it.quantity;
    await p.save();
  }
  const shippingFee = subtotal > 1000 ? 0 : 80; // simple rule for BD
  const total = subtotal + shippingFee;

  const order = await Order.create({
    user: req.user.id,
    items: lineItems,
    subtotal,
    shippingFee,
    total,
    status: paymentMethod === "cod" ? "pending" : "paid",
    paymentMethod,
    shippingAddress
  });

  res.status(StatusCodes.CREATED).json(order);
}

export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function all(req, res) {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
}

export async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  res.json(order);
}