const express = require('express');
const router = express.Router();

const Hotel = require('../model/hotel.model.js');
const requireDb = require('../utils/dbCheck.js');

// GET /api/hotels/:id - return single hotel by MongoDB _id
router.get('/:id', async (req, res) => {
  if (!req.dbConnected) return res.status(503).json({ message: 'Service temporarily unavailable - database not connected' });
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: 'No hotel found with the given ID' });
    return res.json(hotel);
  } catch (err) {
    console.error('Error fetching hotel by id:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
