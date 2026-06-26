const express = require('express');
const router = express.Router();
const Area = require('../models/Area');

// Get all areas
router.get('/', async (req, res) => {
    try {
        const areas = await Area.find();
        res.status(200).json(areas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch areas' });
    }
});

// Get one area by name
router.get('/:areaName', async (req, res) => {
    try {
        const area = await Area.findOne({
            areaName: req.params.areaName
        });

        if (!area) {
            return res.status(404).json({
                message: 'Area not found'
            });
        }

        res.json(area);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
});

module.exports = router;