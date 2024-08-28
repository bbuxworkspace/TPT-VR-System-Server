const router = require('express').Router();
const User = require('../../models/user');
const {verifyRefreshToken} = require('../../utils/jwtUtils');



router.post('/', async (req, res, next) => {
    try {
        const {refreshToken} = req.signedCookies;
        
        // Verify the refresh Token
        const payload = await verifyRefreshToken(refreshToken);

        // Clear the cookie
        res.clearCookie('refreshToken', {
            path: 'api/v1/auth'
        });

        // Remove the refresh Token from sessions

        await User.findOneAndUpdate({_id: payload.userId}, {$pull: {sessions: refreshToken}});
        

        res.json({
            message: 'Logout successfully'
        });
    }
    catch(error) {
        next(error);
    }
});



module.exports = router;