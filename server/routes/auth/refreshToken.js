const router = require('express').Router();
const createError = require('http-errors');
const User = require('../../models/user');
const {signRefreshToken, signAccessToken, verifyRefreshToken} = require('../../utils/jwtUtils');

router.post('/', async (req, res, next) => {
    try {
        const { refreshToken } = req.signedCookies;

        if (!refreshToken) {
            throw createError(401, 'Refresh token is not provided');
        }

        // Verify the refresh token
        const payload = await verifyRefreshToken(refreshToken);

        // Check the expiration date
        if (payload.exp * 1000 < Date.now()) throw createError(401, 'Token expired');

        // Check if user exists
        const user = await User.findOne({ _id: payload.userId });
        if (!user) throw createError(401, 'Invalid user');

        // Create new tokens
        const newRefreshToken = await signRefreshToken({ userId: user._id, role: user.role }, '180d');
        const newAccessToken = await signAccessToken({ userId: user._id, role: user.role }, '1d');

        // Update refresh token in user sessions
        const value = await User.findOneAndUpdate(
            { _id: user._id, sessions: refreshToken },
            { $set: { 'sessions.$[element]': newRefreshToken } },
            { arrayFilters: [{ element: { $eq: refreshToken } }] }
        );

        if (!value) {
            res.clearCookie('refreshToken', { path: 'api/v1/auth' });
            throw createError(401, 'Refresh token is invalid or expired');
        }

        res.cookie('refreshToken', newRefreshToken, {
            maxAge: 15552000000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: 'api/v1/auth',
            signed: true
        });

        res.json({
            message: 'Access token sent successfully',
            accessToken: `Bearer ${newAccessToken}`
        });
    } catch (error) {
        next(error);
    }
});




module.exports = router;