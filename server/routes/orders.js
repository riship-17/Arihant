const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { auth, admin } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const router = express.Router();

const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Your cart is empty. Please add items before placing an order.'),
  body('items.*.product').notEmpty().withMessage('Invalid item in cart.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('items.*.size').notEmpty().withMessage('Please select a size for each item.'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone number is required.')
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number.'),
  body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address is required.'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required.'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required.'),
  body('shippingAddress.zipCode')
    .notEmpty().withMessage('Pincode is required.')
    .matches(/^\d{6}$/).withMessage('Pincode must be exactly 6 digits.'),
  body('paymentMethod').isIn(['COD', 'UPI']).withMessage('Please select a valid payment method.'),
];

// Create order — Price is always recalculated on the backend
router.post('/', auth, orderRules, validate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const ci of items) {
      const dbProduct = await Product.findById(ci.product);
      if (!dbProduct) return res.status(404).json({ message: 'Item not found in our catalogue. Please refresh your cart.' });
      if (!dbProduct.is_active) return res.status(400).json({ message: `"${dbProduct.name}" is no longer available.` });

      // Find the variant for stock check
      const variant = await ProductVariant.findOne({ product_id: dbProduct._id, size: ci.size });
      if (!variant) return res.status(400).json({ message: `Size ${ci.size} is not available for ${dbProduct.name}.` });
      if (!variant.is_available) return res.status(400).json({ message: `Size ${ci.size} for ${dbProduct.name} is currently out of stock.` });
      if (variant.stock_qty < ci.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${dbProduct.name} (${ci.size}). Only ${variant.stock_qty} left.` });
      }

      // Deduct stock
      variant.stock_qty -= ci.quantity;
      if (variant.stock_qty === 0) variant.is_available = false;
      await variant.save();

      orderItems.push({
        product: dbProduct._id,
        variant: variant._id,
        itemName: dbProduct.name,
        itemType: dbProduct.item_type,
        size: ci.size,
        quantity: ci.quantity,
        price_paisa: dbProduct.price_paisa
      });
      totalAmount += (dbProduct.price_paisa * ci.quantity);
    }

    const mappedAddress = {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.addressLine1,
      city: shippingAddress.city,
      pincode: shippingAddress.zipCode,
      state: shippingAddress.state
    };

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: mappedAddress
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// Update order status (Admin)
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }
    
    let updateFields = { orderStatus };
    if (orderStatus === 'shipped' && trackingNumber) {
      updateFields.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
