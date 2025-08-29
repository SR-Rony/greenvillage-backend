import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ["kg", "piece", "dozen", "bundle", "litre"], default: "kg" },
  stock: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-generate slug from name
productSchema.pre("save", function(next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

export default mongoose.model("Product", productSchema);
