const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State'], required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  logo: { type: String },
  banner: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('School', schoolSchema);
