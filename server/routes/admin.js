const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Order = require('../models/Order');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '12345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

// Multer memory storage config
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Dashboard Stats route
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Revenue
    const orders = await Order.find();
    const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const productsCount = await Product.countDocuments({ is_active: true });

    // Low stock: variants with stock_qty < 10
    const lowStockCount = await ProductVariant.countDocuments({
      stock_qty: { $lt: 10 },
      is_available: true
    });

    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    res.json({
      totalOrders,
      revenue,
      productsCount,
      lowStock: lowStockCount,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload image route using Cloudinary stream
router.post('/upload-image', auth, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'arihant_store', resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error);
          return res.status(500).json({ message: 'Error uploading to Cloudinary' });
        }
        res.json({ imageUrl: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
