const mongoose = require('mongoose');

const storeAdminSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  storeName: String,
  phone: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StoreAdmin', storeAdminSchema);
