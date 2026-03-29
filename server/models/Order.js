const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  standard: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard' },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'UniformItem' },
    itemName: String,       // snapshot
    itemType: String,       // snapshot
    size: String,
    quantity: Number,
    price: Number           // snapshot of price at time of order
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  shippingAddress: {
    street: String,
    city: String,
    pincode: String,
    state: String
  },
  trackingNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
