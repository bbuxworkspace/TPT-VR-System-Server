const router = require('express').Router();
const Tile = require('../../models/tile'); // Adjust the path if necessary
const createError = require('http-errors');
const pagination = require('../../utils/pagination');

router.get('/', async (req, res, next) => {
    try {
        // Count total number of tiles in the database
        const totalCount = await Tile.countDocuments();

        // Get pagination parameters
        const { skip, limit } = pagination(req.query, totalCount);

        // Fetch tiles with pagination and sorting
        const tiles = await Tile
            .find({}, { _id: 1, name: 1, size: 1, areaCoverage: 1, price: 1, category: 1, brand: 1, image: 1 }) // Adjust fields as needed
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        // Send response with pagination details
        res.json({
            message: 'All tile details',
            tiles: {
                pageCount: Math.ceil(totalCount / limit),
                itemCount: totalCount,
                items: tiles
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
