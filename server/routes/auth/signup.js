const router = require('express').Router();
const createError = require('http-errors');
const User = require('../../models/user');
const signUp = require('../../validators/signup');
const {hashPassword} = require('../../utils/hashPassword');
const {signRefreshToken} = require('../../utils/jwtUtils');

router.post('/', async (req, res, next) => {
    try {
        const {name, username, password} = await signUp.validateAsync(req.body);

        // Check if user already exists
        const user = await User.findOne({username});
        if (user) throw createError(401, 'User Already Exists');

        // Hash password and generate salt
        const {hash, salt} = await hashPassword(password);

        // Create user account
        const newUser = new User({
            name,
            username,
            hash,
            salt,
            role: 'client'
        });

        const createdUser = await newUser.save();

        // Create Refresh Token
        const refreshToken = await signRefreshToken({userId: createdUser._id, role: createdUser.role}, '180d');

        // Push cookie to sessions in user object
        await User.findOneAndUpdate({_id: createdUser._id}, {$push: {sessions: refreshToken}});

        // Set cookie to response
        res.cookie('refreshToken', refreshToken, {
            maxAge: 15552000000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            path: 'api/v1/auth',
            signed: true
        });

        res.json({
            message: 'Account created successfully'
        });
    }
    catch (error) {
        next(error);
    }
});

module.exports = router;
