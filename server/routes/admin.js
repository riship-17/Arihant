const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const School = require('../models/School');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Multer cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniform-store',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Dashboard Stats route
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayOrders,
      weekOrders, 
      monthOrders,
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalSchools,
      lowStockItems,
      productsCount
    ] = await Promise.all([
      Order.countDocuments({ created_at: { $gte: today }, payment_status: 'paid' }),
      Order.countDocuments({ created_at: { $gte: weekAgo }, payment_status: 'paid' }),
      Order.countDocuments({ created_at: { $gte: monthAgo }, payment_status: 'paid' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { payment_status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total_paisa' } } }
      ]),
      Order.countDocuments({ payment_status: 'paid', order_status: 'pending' }),
      School.countDocuments({ is_active: true }),
      ProductVariant.countDocuments({ stock_qty: { $lte: 5 }, is_available: true }),
      Product.countDocuments({ is_active: true })
    ]);

    res.json({
      todayOrders,
      weekOrders,
      monthOrders,
      totalOrders,
      totalRevenuePaisa: totalRevenue[0]?.total || 0,
      pendingOrders,
      totalSchools,
      lowStock: lowStockItems,
      productsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload image route using CloudinaryStorage
router.post('/upload-image', auth, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      imageUrl: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const Standard = require('../models/Standard');

// Toggle school active/inactive
router.patch('/schools/:id/toggle', auth, admin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    
    school.is_active = !school.is_active;
    await school.save();
    
    res.json({ message: 'Status updated', is_active: school.is_active });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin add standards (supports 'both')
router.post('/standards', auth, admin, async (req, res) => {
  try {
    const { school_id, class_name, gender, division } = req.body;
    
    if (gender === 'both') {
      const boy = await Standard.create({ school_id, class_name, gender: 'boy', division });
      const girl = await Standard.create({ school_id, class_name, gender: 'girl', division });
      return res.status(201).json({ created: [boy, girl] });
    }
    
    const std = await Standard.create({ school_id, class_name, gender, division });
    res.status(201).json({ created: [std] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==============================
// CATALOGUE (Products & Variants)
// ==============================

// Get all products (Admin view)
router.get('/products', auth, admin, async (req, res) => {
  try {
    const { school_id, standard_id, item_type } = req.query;
    const filter = {};
    if (school_id) filter.school_id = school_id;
    if (standard_id) filter.standard_id = standard_id;
    if (item_type) filter.item_type = item_type;

    const products = await Product.find(filter)
      .populate('school_id', 'name')
      .populate('standard_id', 'class_name gender')
      .sort({ created_at: -1 });

    // For admin, we also want to attach variants to each product
    const productsWithVariants = await Promise.all(products.map(async (p) => {
      const variants = await ProductVariant.find({ product_id: p._id }).sort({ size: 1 });
      return { ...p.toObject(), variants };
    }));

    res.json(productsWithVariants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product and auto-generate variants
router.post('/products', auth, admin, async (req, res) => {
  try {
    const { standard_id, school_id, name, item_type, uniform_type, price_paisa, image_url, is_active } = req.body;
    
    const product = await Product.create({
      standard_id, school_id, name, item_type, uniform_type, price_paisa, image_url, is_active: is_active ?? true
    });
    
    // Auto-create variants based on item_type
    const sizeMap = {
      shoes: ['UK3','UK4','UK5','UK6','UK7','UK8','UK9','UK10'],
      socks: ['S','M','L'],
      default: ['XS','S','M','L','XL','XXL']
    };
    
    const isShoes = product.name.toLowerCase().includes('shoes');
    const isSocks = product.name.toLowerCase().includes('socks');
    const sizes = isShoes ? sizeMap.shoes : isSocks ? sizeMap.socks : sizeMap.default;
    
    const variants = sizes.map(size => ({
      product_id: product._id,
      size,
      stock_qty: 0,
      is_available: true
    }));
    await ProductVariant.insertMany(variants);
    
    res.status(201).json({ product, variantsCreated: variants.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product details
router.put('/products/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Soft delete / Toggle active product
router.patch('/products/:id/toggle', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.is_active = !product.is_active;
    await product.save();
    res.json({ message: 'Product toggled', is_active: product.is_active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update stock for a variant
router.patch('/variants/:id/stock', auth, admin, async (req, res) => {
  try {
    const { stock_qty } = req.body;
    const variant = await ProductVariant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    
    variant.stock_qty = parseInt(stock_qty);
    variant.is_available = parseInt(stock_qty) > 0;
    await variant.save();
    
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==============================
// ORDERS MANAGEMENT
// ==============================

// Get all orders with filtering and pagination
router.get('/orders', auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.order_status = status;
    }
    
    const orders = await Order.find(filter)
      .populate('user_id', 'name email phone')
      .populate({
        path: 'items.product_id',
        select: 'name image_url'
      })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(filter);
    
    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status and tracking
const { sendEmail } = require('../utils/email');

router.patch('/orders/:id/status', auth, admin, async (req, res) => {
  try {
    const { order_status, tracking_number } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { order_status };
    if (order_status === 'shipped' && tracking_number) {
      updateData.tracking_number = tracking_number;
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('user_id', 'name email phone');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send email to the customer since SchoolContact does not exist
    if (order_status === 'confirmed' && order.user_id && order.user_id.email) {
      try {
        const itemsHtml = order.items.map(item => `
          <p>${item.product_name_snapshot} - Size: ${item.size_snapshot} - Qty: ${item.quantity}</p>
        `).join('');
        
        await sendEmail({
          to: order.user_id.email,
          subject: `Your Order is Confirmed - ${order._id}`,
          html: `
            <h2>Order Confirmed!</h2>
            <p>Order ID: ${order._id}</p>
            <p>Customer: ${order.user_id.name}</p>
            <p>Address: ${order.address}</p>
            <h3>Items:</h3>
            ${itemsHtml}
            <p>Total: ₹${order.total_paisa / 100}</p>
          `
        });
      } catch (emailErr) {
        console.error("Failed to send order confirmation email:", emailErr);
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
