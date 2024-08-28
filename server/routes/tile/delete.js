const router = require('express').Router();
const Tile = require('../../models/tile');
const createError = require('http-errors');
const { deleteImage } = require('../../utils/imageStore');

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const tile = await Tile.findOneAndDelete({ _id: id });

        if (!tile) throw createError(404, 'Tile not found');

        // Delete the image associated with the tile
        if (tile.image) {
            await deleteImage(tile.image);
        }

        res.json({
            message: 'Tile deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
