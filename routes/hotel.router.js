const express = require('express');
const router = express.Router();

const Hotel = require("../model/hotel.model.js");
const requireDb = require('../utils/dbCheck.js');

router.route("/") // localhost:3500/api/hotels
  .get(async (req, res) => {
    const hotelCategory = req.query.category; // e.g. /api/hotels?category=National+Park
    try {
      // Enforce DB-only behavior: if DB isn't connected return 503 so the frontend uses live DB data.
      if (!req.dbConnected) return res.status(503).json({ message: 'Service temporarily unavailable - database not connected' });

      let hotels;
      if (hotelCategory) {
        hotels = await Hotel.find({ category: hotelCategory });
      } else {
        hotels = await Hotel.find({});
      }

      if (!hotels || hotels.length === 0) {
        return res.status(404).json({ message: "No hotels found" });
      }

      return res.json(hotels);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;