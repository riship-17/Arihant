const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'UniformItem', required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  updatedAt: { type: Date, default: Date.now }
});

cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
