import { StatusCodes } from "http-status-codes";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Create a new order
 */
export async function create(req, res) {
  try {
    const { items, shippingAddress, paymentMethod = "cod", notes } = req.body;
    

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No items provided for the order",
      });
    }

    // Validate shipping address
    const { fullName, phone, zilla, upazila, fullAddress } = shippingAddress || {};
    if (!fullName || !phone || !zilla || !upazila || !fullAddress) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Incomplete shipping address",
      });
    }

    let subtotal = 0;
    const lineItems = [];

    // Validate products, calculate subtotal and update stock atomically
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
        unit: product.unit,
        image: product.images?.[0]?.url || "",
      });

      // Atomic stock decrement
      await Product.findByIdAndUpdate(it.productId, { $inc: { quantity: -it.quantity } });
    }

    const shippingFee = subtotal > 1000 ? 0 : 80; // Free shipping if subtotal > 1000
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user?.id || null,
      items: lineItems,
      subtotal,
      shippingFee,
      total,
      status: paymentMethod === "cod" ? "pending" : "paid",
      paymentMethod,
      shippingAddress,
      notes,
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
  // try {
  //   const userId = req.params.id; // get from auth or param
    
  //   if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

  //   const orders = await Order.find({ user: userId })
  //     .sort({ createdAt: -1 })
  //     .populate("items.product", "name price unit images");

  //   res.status(200).json({ success: true, orders });
  // } catch (err) {
  //   console.error("Fetch my orders error:", err);
  //   res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
  // }
   try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Get all orders (Admin)
 */
export async function all(req, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price unit images")
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

/**
 * Get single order by ID (Admin or owner)
 */
export async function getOne(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product", "name price unit images");

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    // If user is not admin, check ownership
    if (!req.user.isAdmin && order.user?.toString() !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch order",
      error: err.message,
    });
  }
}
