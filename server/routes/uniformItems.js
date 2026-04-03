const express = require('express');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// GET /api/uniform-items — Get all products (with filters)
// Usage: /api/uniform-items?standard=<standardId>&itemType=shirt
router.get('/', async (req, res) => {
  try {
    const { standard, itemType, isActive } = req.query;
    let query = {};
    if (standard) query.standard_id = standard;
    if (itemType) query.item_type = itemType;
    if (isActive !== undefined) query.is_active = isActive === 'true';
    else query.is_active = true; // default to active only

    const products = await Product.find(query)
      .populate({
        path: 'standard_id',
        populate: { path: 'school_id', select: 'name logo banner area city' }
      })
      .populate('school_id', 'name logo banner area city');

    // Attach variants to each product
    const productIds = products.map(p => p._id);
    const allVariants = await ProductVariant.find({ product_id: { $in: productIds } });

    const result = products.map(p => {
      const pObj = p.toObject();
      pObj.variants = allVariants.filter(v => v.product_id.equals(p._id));
      return pObj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/uniform-items/:id — Get product by ID with variants
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'standard_id',
        populate: { path: 'school_id', select: 'name logo banner area city' }
      })
      .populate('school_id', 'name logo banner area city');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variants = await ProductVariant.find({ product_id: product._id });
    const result = { ...product.toObject(), variants };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/uniform-items — Create product (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/uniform-items/:id — Update product (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
