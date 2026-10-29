const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, unique: true, sparse: true },
    price: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
