const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Order = require('../models/Order');
const UniformItem = require('../models/UniformItem');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Cloudinary config
// Needs to be provided in environment variables for production
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
    // Assuming we count all revenue or filter by 'paid' + COD 'pending'
    const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const items = await UniformItem.find();
    let lowStockCount = 0;
    items.forEach(item => {
      if (item.sizes.some(s => s.stock < 10)) {
        lowStockCount++;
      }
    });

    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    res.json({
      totalOrders,
      revenue,
      itemsCount: items.length,
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
    // Multer errors get caught here if thrown
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
