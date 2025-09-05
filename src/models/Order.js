import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional if guest checkout
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },      // snapshot of product name
        price: { type: Number, required: true },     // snapshot of product price
        quantity: { type: Number, required: true },
        unit: { type: String, default: "pcs" },      // product unit snapshot
        image: { type: String },                     // optional: product image snapshot
      },
    ],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      zilla: { type: String, required: true },
      upazila: { type: String, required: true },
      fullAddress: { type: String, required: true },
    },
    notes: { type: String }, // optional customer notes
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
