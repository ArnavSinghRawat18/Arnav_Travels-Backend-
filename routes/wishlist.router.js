const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth.js');
const Wishlist = require('../model/wishlist.model.js');

// POST /api/wishlist - add item for authenticated user
router.post('/', requireAuth, async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ message: 'Unauthorized' });
		const { hotelId } = req.body;
		if (!hotelId) return res.status(400).json({ message: 'hotelId required' });
		const item = new Wishlist({ hotelId, userId });
		const saved = await item.save();
		return res.status(201).json(saved);
	} catch (err) {
		console.error('Wishlist POST error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// GET /api/wishlist - get items for authenticated user
router.get('/', requireAuth, async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		const items = await Wishlist.find({ userId });
		return res.json(items);
	} catch (err) {
		console.error('Wishlist GET error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// DELETE /api/wishlist/:id - delete item
router.delete('/:id', requireAuth, async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		const deleted = await Wishlist.findOneAndDelete({ _id: req.params.id, userId });
		if (!deleted) return res.status(404).json({ message: 'Not found' });
		return res.json({ message: 'Deleted', id: deleted._id });
	} catch (err) {
		console.error('Wishlist DELETE error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
