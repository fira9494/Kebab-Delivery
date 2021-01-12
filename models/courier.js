const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  company: { type: String, required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId }],
});

module.exports = mongoose.model('Courier', courierSchema);
