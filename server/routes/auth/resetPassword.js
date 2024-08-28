const router = require('express').Router();
const createError = require('http-errors');
const User = require('../../models/user');
const resetPasswordValidator = require('../../validators/reset');
const {signRefreshToken} = require('../../utils/jwtUtils');
const {hashPassword} = require('../../utils/hashPassword');

router.post('/', async (req, res, next) => {
    try {
        const {username, newPassword} = await resetPasswordValidator.validateAsync(req.body);

        // Check if user already exists
        const user = await User.findOne({username});
        if(!user) throw createError(401, 'User not found');

        // Hash the new password and use the existing salt
        const { hash: newPasswordHash } = await hashPassword(newPassword, user.salt);

        // Update the user's password hash
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { hash: newPasswordHash } },
            { new: true } // Return the updated document
        );

        if (!updatedUser) throw createError(500, 'Failed to update password');

        // Create a new Refresh Token
        const refreshToken = await signRefreshToken({ userId: updatedUser._id, role: updatedUser.role }, '180d');

        // Push the new refresh token to the sessions in the user object
        await User.findOneAndUpdate(
            { _id: updatedUser._id },
            { $push: { sessions: refreshToken } }
        );

        // Set cookie to response
        res.cookie('refreshToken', refreshToken, {
            maxAge: 15552000000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            path: 'api/v1/auth',
            signed: true
        });

        res.json({
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
});



module.exports = router;