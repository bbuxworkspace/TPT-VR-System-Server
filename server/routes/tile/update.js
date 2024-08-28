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

        if (req.file) {
            const image = await saveImage(req.file);
            updateData.image = image;
        }

        const tile = await Tile.findOneAndUpdate({ _id: id }, { $set: updateData });

        if (!tile) throw createError(404, 'Tile not found');

        res.json({
            message: 'Tile updated successfully',
        });

        // Delete the old image if a new one is uploaded
        if (req.file) {
            await deleteImage(tile.image);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
