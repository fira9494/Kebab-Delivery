const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  discount: Number,
  newPrice: Number,
  redeemed: String,
  image: String,
});

module.exports = mongoose.model('Order', orderSchema);
