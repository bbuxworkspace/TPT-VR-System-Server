const router = require('express').Router();
const User = require('../../models/user');
const Tile = require('../../models/tile');


router.get('/', async (req, res, next) => {
    try {

        const userCount = await User.countDocuments();
        const tileCount = await Tile.countDocuments();


        res.json({
            message: 'Dashboard data',
            data: {
                userCount,
                tileCount
            }
        })
    }
    catch(error) {
        next(error);
    }
})

module.exports = router;