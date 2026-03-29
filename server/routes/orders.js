const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const UniformItem = require('../models/UniformItem');
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

// Create order from cart — Price is always recalculated on the backend
router.post('/', auth, orderRules, validate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const ci of items) {
      const dbItem = await UniformItem.findById(ci.product);
      if (!dbItem) return res.status(404).json({ message: `Item not found in our catalogue. Please refresh your cart.` });
      if (!dbItem.isActive) return res.status(400).json({ message: `"${dbItem.itemName}" is no longer available.` });
      
      const sizeEntry = dbItem.sizes.find(s => s.size === ci.size);
      if (!sizeEntry) return res.status(400).json({ message: `Size ${ci.size} is not available for ${dbItem.itemName}.` });
      if (sizeEntry.stock < ci.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${dbItem.itemName} (${ci.size}). Only ${sizeEntry.stock} left.` });
      }

      // Always use DB price — never trust frontend prices
      sizeEntry.stock -= ci.quantity;
      await dbItem.save();

      orderItems.push({
        item: dbItem._id,
        itemName: dbItem.itemName,
        itemType: dbItem.itemType,
        size: ci.size,
        quantity: ci.quantity,
        price: dbItem.price  // DB price, not from frontend
      });
      totalAmount += (dbItem.price * ci.quantity);  // DB price
    }

    const mappedAddress = {
      street: shippingAddress.addressLine1,
      city: shippingAddress.city,
      pincode: shippingAddress.zipCode,
      state: shippingAddress.state,
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone
    };

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,  // backend-calculated total
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
      .populate('school', 'name')
      .populate('standard', 'className gender')
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
      .populate('school', 'name')
      .populate('standard', 'className gender')
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
