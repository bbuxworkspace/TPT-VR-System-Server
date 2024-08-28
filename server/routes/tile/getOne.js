const router = require('express').Router();
const Tile = require('../../models/tile'); // Adjust the path if necessary
const createError = require('http-errors');

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the tile by its ID
        const tile = await Tile.findOne({ _id: id }, { __v: 0 });

        if (!tile) throw createError(404, 'Tile not found');

        // Send response with tile details
        res.json({
            message: 'Tile details',
            tile: tile.toJSON()
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
