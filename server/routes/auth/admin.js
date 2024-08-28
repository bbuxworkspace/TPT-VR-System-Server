const express = require('express');
const router = express.Router();
const { hashPassword } = require('../../utils/hashPassword'); // Adjust the path if necessary
const { signRefreshToken } = require('../../utils/jwtUtils'); // Adjust the path if necessary
const User = require('../../models/user'); // Adjust the path if necessary
require('dotenv').config();

const { ADMIN_NAME, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

// POST /auth/admin/create
router.post('/', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Hash the admin password
        const { hash, salt } = await hashPassword(ADMIN_PASSWORD);

        // Create the admin user
        const newAdmin = new User({
            name: ADMIN_NAME,
            username: ADMIN_USERNAME,
            hash,
            salt,
            role: 'admin'
        });

        const createdAdmin = await newAdmin.save();

        // Create Refresh Token
        const refreshToken = await signRefreshToken({ userId: createdAdmin._id, role: createdAdmin.role }, '180d');

        // Push refresh token to sessions in user object
        await User.findOneAndUpdate({ _id: createdAdmin._id }, { $push: { sessions: refreshToken } });

        res.status(200).json({
            message: 'Admin user created successfully',
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
