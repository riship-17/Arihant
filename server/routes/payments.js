const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create payment for an order
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const payment = await Payment.create({
      order: orderId,
      amount,
      method,
      status: 'pending'
    });

    // Link payment to order
    order.paymentId = payment._id;
    await order.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify payment (callback from gateway)
router.post('/verify', auth, async (req, res) => {
  try {
    const { paymentId, gatewayReferenceId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.gatewayReferenceId = gatewayReferenceId;
    payment.status = status; // 'success' or 'failed'
    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = status === 'success' ? 'paid' : 'failed';
      if (status === 'success') order.orderStatus = 'confirmed';
      await order.save();
    }

    res.json({ payment, order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment by order ID
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
