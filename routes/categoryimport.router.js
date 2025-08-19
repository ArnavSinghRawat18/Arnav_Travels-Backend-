const express = require('express');

const Category = require('../model/category.model.js');
const categories = require('../data/categories.js');

const router = express.Router();

// POST / - import categories dataset into MongoDB (destructive)
router.post('/', async (req, res) => {
    try {
        // remove all documents before inserting fresh data
        await Category.deleteMany({});

        if (!categories || !Array.isArray(categories.data)) {
            const msg = 'categories.data is missing or not an array';
            console.error(msg);
            return res.status(500).json({ message: msg });
        }

        const categoriesInDB = await Category.insertMany(categories.data);
        console.log(`Imported ${categoriesInDB.length} categories`);
        return res.json(categoriesInDB);
    } catch (error) {
        console.error('Error importing data:', error && (error.stack || error.message) ? (error.stack || error.message) : error);
        return res.status(500).json({ message: 'Error importing data', error: error && error.message ? error.message : undefined });
    }
});

module.exports = router;
