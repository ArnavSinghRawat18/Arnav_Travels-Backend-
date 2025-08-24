const express = require('express');
const User = require('../model/user.model.js');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const loginHandler=require('../controllers/loginController.js');
const requireAuth = require('../middleware/auth.js');
const mongoose = require('mongoose');
const Wishlist = require('../model/wishlist.model.js');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, number, email, password } = req.body;
    if (!username || !number || !email || !password) {
      return res.status(400).json({ message: 'username, number, email, password required' });
    }
    // Hash password with bcrypt for new users
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      username,
      number,
      email,
      password: hashed,
    });
    const savedUser = await newUser.save();
    const payload = { id: savedUser._id.toString(), username: savedUser.username, number: savedUser.number };
  const secret = process.env.ACCESS_TOKEN;
  if (!secret) throw new Error('ACCESS_TOKEN is not configured');
    const accessToken = jwt.sign(payload, secret, { expiresIn: '1d' });
    const userObj = savedUser.toObject();
    delete userObj.password;
    return res.status(201).json({ ...userObj, accessToken });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
  const { number, username, password } = req.body;
    if (!password || (!number && !username)) {
      return res.status(400).json({ message: 'Provide number or username and password' });
    }
    const user = await User.findOne({ $or: [{ number }, { username }] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    // First try bcrypt compare
    const isBcrypt = user.password && user.password.startsWith('$2');
    let passwordMatches = false;
    if (isBcrypt) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      // fallback: try AES decrypt (legacy) and then migrate to bcrypt on success
      try {
        const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        if (originalPassword && originalPassword === password) {
          passwordMatches = true;
          // migrate: hash with bcrypt and save
          const saltRounds = 10;
          const newHash = await bcrypt.hash(password, saltRounds);
          user.password = newHash;
          await user.save();
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!passwordMatches) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user._id.toString(), username: user.username, number: user.number };
  const secret = process.env.ACCESS_TOKEN;
  if (!secret) throw new Error('ACCESS_TOKEN is not configured');
    const accessToken = jwt.sign(payload, secret, { expiresIn: '1d' });
    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ ...userObj, accessToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// POST /api/wishlist -> add item (protected)
router.post('/wishlist', requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };
    const item = new Wishlist(payload);
    const saved = await item.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Wishlist POST error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/wishlist -> get items for current user (protected)
router.get('/wishlist', requireAuth, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user.id });
    return res.json(items);
  } catch (err) {
    console.error('Wishlist GET error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/wishlist/:id -> delete (protected)
router.delete('/wishlist/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Wishlist.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted', id: deleted._id });
  } catch (err) {
    console.error('Wishlist DELETE error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;