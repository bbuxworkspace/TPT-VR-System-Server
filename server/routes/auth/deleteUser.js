const router = require('express').Router();
const User = require('../../models/user');
const { verifyAccessToken } = require('../../utils/jwtUtils');

router.delete('/', async (req, res, next) => {
    try {
        // Extract and verify the access token from headers
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) return res.status(401).json({ message: 'Access token is missing' });

        // Verify the access Token
        const payload = await verifyAccessToken(accessToken);

        // Find and delete the user
        const user = await User.findByIdAndDelete(payload.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            path: 'api/v1/auth'
        });

        res.json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
