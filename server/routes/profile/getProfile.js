const router = require('express').Router();
const User = require('../../models/user');




router.get('/', async (req, res, next) => {
    try {
        const {userId} = req.user;
        
        const user = await User.findOne({_id: userId}, {_id: 1, username: 1, name: 1, image: 1});

        res.json({
            message: 'Profile info',
            user,
        });
    }
    catch(err) {
        next(err);
    }
});


module.exports = router;