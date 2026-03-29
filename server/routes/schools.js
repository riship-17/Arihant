const express = require('express');
const School = require('../models/School');
const Standard = require('../models/Standard');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

// Get all schools (Admin sees all, others see active)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.admin === 'true' ? {} : { isActive: true };
    const schools = await School.find(filter);
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

// Create school (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json(school);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit school (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
