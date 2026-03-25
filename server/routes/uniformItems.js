const express = require('express');
const UniformItem = require('../models/UniformItem');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Get all uniform items (with filters)
router.get('/', async (req, res) => {
  try {
    const { standard, itemType, isActive } = req.query;
    let query = {};
    if (standard) query.standard = standard;
    if (itemType) query.itemType = itemType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const items = await UniformItem.find(query)
      .populate({
        path: 'standard',
        populate: { path: 'school', select: 'name logo banner' }
      });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get uniform item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await UniformItem.findById(req.params.id)
      .populate({
        path: 'standard',
        populate: { path: 'school', select: 'name logo banner' }
      });
    if (!item) return res.status(404).json({ message: 'Uniform item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create uniform item (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const item = await UniformItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update uniform item (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const item = await UniformItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Uniform item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
