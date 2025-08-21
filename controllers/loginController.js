const express = require('express');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model.js');

const loginHandler = async (req, res) => {
    try {
        const { number, username, password } = req.body;
        const user = await User.findOne({ $or: [{ number }, { username }] });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        let originalPassword = '';
        try {
            const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY);
            originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (_) {}

        const passwordMatches = (originalPassword && originalPassword === password) || user.password === password;
        if (!passwordMatches) return res.status(401).json({ message: 'Invalid credentials' });

        const { password: pwd, ...rest } = user.toObject();
        const accessToken = jwt.sign({ id: user._id.toString(), username: user.username, number: user.number }, process.env.ACCESS_TOKEN || process.env.PASSWORD_SECRET_KEY, { expiresIn: '1d' });
        return res.json({ ...rest, accessToken });
    } catch (err) {
        console.error('Login handler error:', err);
        return res.status(500).json({ message: 'Login error', error: err.message });
    }
};

module.exports = loginHandler;