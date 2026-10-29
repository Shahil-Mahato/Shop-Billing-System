const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  qty: Number,
  price: Number,    
  gstRate: Number,
  taxable: Number,   
  tax: Number,       
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  number:    { type: String, unique: true },
  customer:  { type: String, default: 'Walk-in customer' },
  gstin:     String,
  interState:{ type: Boolean, default: false },
  items:     [itemSchema],
  taxable:   Number,
  cgst:      Number,
  sgst:      Number,
  igst:      Number,
  total:     Number,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);