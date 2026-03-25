const mongoose = require('mongoose');

const standardSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  className: { type: String, required: true }, // e.g. "Grade 5", "Class 10"
  gender: { type: String, enum: ['boy', 'girl', 'unisex'], default: 'unisex' },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate class+gender per school
standardSchema.index({ school: 1, className: 1, gender: 1 }, { unique: true });

module.exports = mongoose.model('Standard', standardSchema);
