const express = require('express');

const Hotel = require('../model/hotel.model.js');
const hotels = require('../data/hotels');

const router = express.Router();

// POST / - import hotels dataset into MongoDB (destructive)
router.post('/', async (req, res) => {
    try {
        // remove all documents before inserting fresh data
        await Hotel.deleteMany({});
        const hotelsInDB = await Hotel.insertMany(hotels.data);
        return res.json(hotelsInDB);
    } catch (error) {
        console.error('Error importing data:', error);
        return res.status(500).json({ message: 'Error importing data' });
    }
});

module.exports = router;
