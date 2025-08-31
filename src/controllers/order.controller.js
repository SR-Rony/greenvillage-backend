import { StatusCodes } from "http-status-codes";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Create a new order
 */
export async function create(req, res) {
  try {
    const { items, shippingAddress, paymentMethod = "cod" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No items provided for the order",
      });
    }

    let subtotal = 0;
    const lineItems = [];

    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Invalid product with ID: ${it.productId}`,
        });
      }

      if (product.quantity < it.quantity) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      subtotal += product.price * it.quantity;
      lineItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: it.quantity,
      });

      // Decrease stock
      product.quantity -= it.quantity;
      await product.save();
    }

    const shippingFee = subtotal > 1000 ? 0 : 80; // Free shipping if subtotal > 1000
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user.id,
      items: lineItems,
      subtotal,
      shippingFee,
      total,
      status: paymentMethod === "cod" ? "pending" : "paid",
      paymentMethod,
      shippingAddress,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  }
}

/**
 * Get orders of the logged-in user
 */
export async function myOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Fetch my orders error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
}

/**
 * Get all orders (Admin)
 */
export async function all(req, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Fetch all orders error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch all orders",
      error: err.message,
    });
  }
}

/**
 * Update order status (Admin)
 */
export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update order status",
      error: err.message,
    });
  }
}
