const express = require('express');
const router = express.Router();

const Category = require("../model/category.model");
const requireDb = require('../utils/dbCheck.js');

router.route("/")
    .get(async (req, res) => {
        if (!req.dbConnected) return res.status(503).json({ message: 'Service temporarily unavailable - database not connected' });
        try {
            const categories = await Category.find({});
            res.json(categories);
        } catch(err){
            res.status(404).json({ message: "Could not find categories" })
        }
    })
    module.exports = router;
