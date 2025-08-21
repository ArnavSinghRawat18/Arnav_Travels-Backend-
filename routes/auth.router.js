const express = require('express');
const User = require('../model/user.model.js');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const router = express.Router();
const loginHandler=require('../controllers/loginController.js');


// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, number, email, password } = req.body;
    if (!username || !number || !email || !password) {
      return res.status(400).json({ message: 'username, number, email, password required' });
    }
    const newUser = new User({
      username,
      number,
      email,
      password: CryptoJS.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY).toString(),
    });
    const savedUser = await newUser.save();
    const payload = { id: savedUser._id.toString(), username: savedUser.username, number: savedUser.number };
    const secret = process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET_KEY || process.env.PASSWORD_SECRET_KEY;
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
    let originalPassword = '';
    try {
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY);
      originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    } catch (_) {}
    const passwordMatches = (originalPassword && originalPassword === password) || user.password === password;
    if (!passwordMatches) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user._id.toString(), username: user.username, number: user.number };
    const secret = process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET_KEY || process.env.PASSWORD_SECRET_KEY;
    const accessToken = jwt.sign(payload, secret, { expiresIn: '1d' });
    const userObj = user.toObject();
    delete userObj.password;
    return res.json({ ...userObj, accessToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

module.exports = router;