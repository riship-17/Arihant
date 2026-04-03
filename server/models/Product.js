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

  // Legacy single image field (kept for backward compatibility)
  image_url: { type: String, default: null },

  // Gallery — multiple images with Unsplash attribution
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String },
      is_primary: { type: Boolean, default: false },
      attribution: {
        photographer: { type: String },
        photographer_url: { type: String },
        source: { type: String, default: 'Unsplash' }
      }
    }
  ],

  // Shortcut: first image URL for list views (auto-set by pre-save hook)
  primary_image: { type: String, default: null },

  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

// Auto-set primary_image from images[0] before save
productSchema.pre('save', function() {
  if (this.images && this.images.length > 0) {
    this.images[0].is_primary = true;
    this.primary_image = this.images[0].url;
  } else if (this.image_url && !this.primary_image) {
    // Backward compat: use legacy image_url as primary if no gallery
    this.primary_image = this.image_url;
  }
});

module.exports = mongoose.model('Product', productSchema);
