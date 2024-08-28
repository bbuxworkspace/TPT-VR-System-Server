const router = require('express').Router();
const createError = require('http-errors');
const { upload, saveImage } = require('../../utils/imageStore');
const Tile = require('../../models/tile'); // Make sure this points to your Tile schema

router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        const { name, size, areaCoverage, price, category, brand } = req.body;

        if (!req.file) throw createError(422, 'Image must be provided');

        const image = await saveImage(req.file);

        await new Tile({
            name,
            size,
            areaCoverage,
            price,
            category,
            image: image,  // Images as an array
            brand
        }).save();

        res.json({
            message: 'Tile is created successfully'
        });
    }
    catch (error) {
        next(error);
    }
});

module.exports = router;
