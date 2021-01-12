const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: false },
  email: { type: String, unique: true, required: false },
  password: { type: String, required: false },
  telephone: { type: String, required: false },
  address: { type: String, required: false },
  orders: [{ type: mongoose.Schema.Types.ObjectId }],
});

module.exports = mongoose.model('Client', clientSchema);
