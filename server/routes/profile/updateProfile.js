const router = require('express').Router();
const User = require('../../models/user');
const {upload, saveImage, deleteImage} = require('../../utils/imageStore');



router.patch('/', upload.single('image'), async (req, res, next) => {
    try {
        const {userId} = req.user;
        const {name} = req.body;

        const updateInfo = {};
        
        // Check if name and address is given
        if(name) updateInfo.name = name;

        if(req.file) {
            const images = await saveImage(req.file);
            updateInfo.image = images;
        }
        
        const user = await User.findOneAndUpdate({_id: userId}, {$set: updateInfo});

        res.json({
            message: 'Profile is updated successfully',
        });

        if(user && req.file && user.image !== 'default.png') {
            await deleteImage(user.image);
        }
    }
    catch(err) {
        next(err);
    }
});


module.exports = router;