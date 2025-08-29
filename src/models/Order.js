import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  quantity: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "shipped", "delivered", "cancelled"], default: "pending" },
  paymentMethod: { type: String, enum: ["cod", "card"], default: "cod" },
  shippingAddress: {
    name: String,
    phone: String,
    address1: String,
    address2: String,
    city: String,
    postcode: String
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);