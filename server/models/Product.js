const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  standard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolStandard', required: true },
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  item_type: {
    type: String,
    enum: [
      'shirt', 'pant', 'shoes', 't-shirt', 'top', 'frock',
      'track', 'trouser', 'blazer', 'jacket', 'capri',
      'denim', 'shorts', 'skirt', 'belt', 'tie', 'socks'
    ],
    required: true
  },
  uniform_type: {
    type: String,
    enum: ['regular', 'sports', 'house'],
    default: 'regular'
  },
  price_paisa: { type: Number, default: 0 },
  image_url: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
