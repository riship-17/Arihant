const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { sendOrderConfirmationEmails } = require('../services/emailService');

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    // Create Razorpay order
    const options = {
      amount, // amount in paisa
      currency,
      receipt
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    res.status(200).json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ message: 'Failed to create payment order.' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    
    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
      
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 2. Process Order Data (Deduct Stock & Build Order)
    const { items, shippingAddress, paymentMethod } = orderData;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const ci of items) {
      const dbProduct = await Product.findById(ci.product || ci.item_id);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: 'Item not found in our catalogue.' });
      }

      // Find the variant for stock check
      const variant = await ProductVariant.findOne({ product_id: dbProduct._id, size: ci.size || ci.selected_size });
      if (!variant) {
        return res.status(400).json({ success: false, message: `Size ${ci.size || ci.selected_size} is not available.` });
      }
      
      // We process order even if stock went negative just now to not lose paid order, 
      // but ideally this is handled neatly. We will forcefully deduct.
      variant.stock_qty -= ci.quantity;
      if (variant.stock_qty <= 0) {
        variant.stock_qty = 0;
        variant.is_available = false;
      }
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

    // 3. Save Order to Database
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: mappedAddress,
      orderStatus: 'processing',
      paymentStatus: 'paid',
      razorpay_order_id,
      razorpay_payment_id
    });

    // 4. Send Email Notifications
    // Since JWT only has id, we fetch full user object for the email templates
    const User = require('../models/User');
    const fullUser = await User.findById(req.user.id);
    await sendOrderConfirmationEmails(order, fullUser);

    res.status(200).json({ success: true, message: 'Payment verified and order saved', orderId: order._id });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    // Note: We'd want manual intervention if stock failed after payment verification.
    res.status(500).json({ success: false, message: error.message || String(error) });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.product',
        select: 'name image_url price_paisa item_type'
      })
      .populate('school', 'name')
      .populate('standard', 'class_name gender');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Verify ownership
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. This order does not belong to you.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Get Order Detail Error:', error);
    res.status(500).json({ message: 'Failed to fetch order details.' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name image_url'
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ message: 'Failed to fetch your orders.' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getOrderDetail,
  getUserOrders
};

