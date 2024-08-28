const router = require('express').Router();
const createError = require('http-errors');
const User = require('../../models/user');
const login = require('../../validators/login');
const {signRefreshToken} = require('../../utils/jwtUtils');
const {checkPassword} = require('../../utils/hashPassword');

router.post('/', async (req, res, next) => {
    try {
        const {username, password} = await login.validateAsync(req.body);

        // Check if user already exists
        const user = await User.findOne({username});

        if (!user) throw createError(401, 'Invalid Login');

        // Check Password
        const check = await checkPassword(password, user.hash, user.salt);

        if (!check) throw createError(401, 'Invalid Login');

        // Create Refresh Token
        const refreshToken = await signRefreshToken({userId: user._id, role: user.role}, '180d');

        // Push cookie to sessions in user object
        await User.findOneAndUpdate({_id: user._id}, {$push: {sessions: refreshToken}});

        // Set cookie to response
        res.cookie('refreshToken', refreshToken, {
            maxAge: 15552000000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            path: 'api/v1/auth',
            signed: true
        });

        res.json({
            message: 'Login successfully'
        });
    }
    catch (error) {
        next(error);
    }
});

module.exports = router;
