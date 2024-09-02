const router = require('express').Router();
const { upload, saveImage, deleteImage } = require('../../utils/imageStore');
const Tile = require('../../models/tile');

router.patch('/:id', upload.single('image'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, size, areaCoverage, price, category } = req.body;

        const updateData = {};

        if (name) updateData.name = name;
        if (size) updateData.size = size;
        if (areaCoverage) updateData.areaCoverage = areaCoverage;
        if (price) updateData.price = price;
        if (category) updateData.category = category;

        // Find the tile first to retrieve the old image URL if it exists
        const tile = await Tile.findById(id);
        if (!tile) throw createError(404, 'Tile not found');

        // If a new image is uploaded, save it and update the image field
        if (req.file) {
            const newImage = await saveImage(req.file);
            updateData.image = newImage;

            // Delete the old image if it exists
            if (tile.image) {
                await deleteImage(tile.image);
            }
        }

        // Update the tile with new data
        await Tile.findByIdAndUpdate(id, { $set: updateData });

        res.json({
            message: 'Tile updated successfully',
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
