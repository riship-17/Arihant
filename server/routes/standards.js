const express = require('express');
const Standard = require('../models/Standard');
const router = express.Router();

// Get standards for a school
router.get('/', async (req, res) => {
  try {
    const { school } = req.query;
    let query = {};
    if (school) query.school = school;

    const standards = await Standard.find(query).populate('school', 'name logo');
    res.json(standards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get standard by ID
router.get('/:id', async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id).populate('school', 'name logo banner');
    if (!standard) return res.status(404).json({ message: 'Standard not found' });
    res.json(standard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create standard
router.post('/', async (req, res) => {
  try {
    const standard = await Standard.create(req.body);
    res.status(201).json(standard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
