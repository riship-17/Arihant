const express = require('express');
const School = require('../models/School');
const Standard = require('../models/Standard');
const router = express.Router();

// Get all active schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find({ isActive: true });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get school by ID (with its standards)
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });

    const standards = await Standard.find({ school: school._id });
    res.json({ ...school.toObject(), standards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create school (Admin only in future)
router.post('/', async (req, res) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json(school);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
