const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  nome: { type: String, required: true },
  rating: { type: Number, required: true },
  comentario: String,
  date: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
