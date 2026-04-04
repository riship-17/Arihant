const express = require('express');
const Order = require('../models/Order');
const { auth, admin } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { createRazorpayOrder, verifyPayment } = require('../controllers/orderController');
const { sendStatusUpdateEmail } = require('../services/emailService');
const User = require('../models/User');

const router = express.Router();

const orderRules = [
  body('orderData.items').isArray({ min: 1 }).withMessage('Your cart is empty.'),
  body('orderData.shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('orderData.shippingAddress.phone').notEmpty().withMessage('Phone number is required.'),
  body('orderData.shippingAddress.addressLine1').trim().notEmpty().withMessage('Address is required.'),
  body('orderData.shippingAddress.city').trim().notEmpty().withMessage('City is required.'),
  body('orderData.shippingAddress.state').trim().notEmpty().withMessage('State is required.'),
  body('orderData.shippingAddress.zipCode').notEmpty().withMessage('Pincode is required.')
];

// Create COD order
router.post('/', auth, async (req, res) => {
  try {
    const orderData = req.body.orderData ? req.body.orderData : req.body;
    const { items, shippingAddress, paymentMethod } = orderData;
    
    // Quick COD stock logic matching verifyPayment structure
    const ProductVariant = require('../models/ProductVariant');
    const Product = require('../models/Product');
    const { sendOrderConfirmationEmails } = require('../services/emailService');

    const orderItems = [];
    let totalAmount = 0;

    for (const ci of items) {
      const dbProduct = await Product.findById(ci.product || ci.item_id);
      if (!dbProduct) return res.status(404).json({ message: 'Item not found' });

      const variant = await ProductVariant.findOne({ product_id: dbProduct._id, size: ci.size || ci.selected_size });
      if (!variant) return res.status(400).json({ message: 'Size not found' });
      
      variant.stock_qty -= ci.quantity;
      if (variant.stock_qty <= 0) { variant.stock_qty = 0; variant.is_available = false; }
      await variant.save();

      orderItems.push({
        product: dbProduct._id,
        variant: variant._id,
        itemName: dbProduct.name,
        itemType: dbProduct.item_type,
        size: ci.size || ci.selected_size,
        quantity: ci.quantity,
        price_paisa: dbProduct.price_paisa
      });
      totalAmount += (dbProduct.price_paisa * ci.quantity);
    }

    const mappedAddress = {
      fullName: shippingAddress.fullName || shippingAddress.name,
      phone: shippingAddress.phone || shippingAddress.contact,
      street: shippingAddress.addressLine1 || shippingAddress.address,
      city: shippingAddress.city,
      pincode: shippingAddress.zipCode || shippingAddress.pincode,
      state: shippingAddress.state
    };

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: mappedAddress,
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    const fullUser = await User.findById(req.user.id);
    if (fullUser) await sendOrderConfirmationEmails(order, fullUser);

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/orders/create-razorpay-order
router.post('/create-razorpay-order', auth, createRazorpayOrder);

// POST /api/orders/verify-payment
router.post('/verify-payment', auth, orderRules, validate, verifyPayment);

// Get user orders (List)
router.get('/my-orders', auth, getUserOrders);

// Get specific order detail (ID)
router.get('/my-orders/:id', auth, getOrderDetail);

// Get all orders (Admin)
router.get('/', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

module.exports = router;
