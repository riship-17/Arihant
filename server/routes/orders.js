const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const UniformItem = require('../models/UniformItem');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Create order from cart
router.post('/', auth, async (req, res) => {
  try {
    const { schoolId, standardId, shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.item');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Build order items as snapshot
    const orderItems = cart.items.map(ci => ({
      item: ci.item._id,
      itemName: ci.item.itemName,
      itemType: ci.item.itemType,
      size: ci.size,
      quantity: ci.quantity,
      price: ci.item.price
    }));

    const totalAmount = orderItems.reduce((sum, oi) => sum + (oi.price * oi.quantity), 0);

    const order = await Order.create({
      user: req.user.id,
      school: schoolId,
      standard: standardId,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    // Clear the cart after order
    await Cart.findOneAndDelete({ user: req.user.id });

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
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
